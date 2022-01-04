---
title: From Zero to Data-Ready (Part 3)
date: 2021-06-01
tags: [Data Engineering, Retail Project, From Zero to Data-Ready]
image:
    src: /assets/img/2021-06-01-from-zero-to-data-ready-part-3/code.jpg
    alt: Code
---

In [Part 2](/posts/from-zero-to-data-ready-part-2/) we created a data warehouse using sqitch. In this post we will focus on creating ETLs for our data. We will build our ETLs in Python using Test Driven Development as our paradigm.

# Testing our Data Pipelines

Test Driven Development is a programming paradigm that emphasizes writing tests for each of the important aspects of our application before we even write the first line of code. The reasoning is that the tests serve as a specification of how the application or its components should behave. Therefore once the tests pass we know that the application is correct.

In real life testing is never easy, though. Programs often have to make calls to external services we do not control. Thankfully, any robust testing framework should provide ways to either mock or intercept calls to the external environment. With this in mind, good tests are those that make sure that external services were called appropiately and that any internal state modification left the application in a correct state.

We need to build three data pipelines:
- `process_raw_dump`: takes the `database.mdb` file and extracts all `.csv` files from it. These files are then written to a bucket in Google Cloud Storage.
- `process_csv_dump`: downloads the `.csv` files that we are going to use to populate our data warehouse, processes and cleans the data, and uploads it to the `staging` schema of the data warehouse.
- `populate_warehouse`: populates the `public` schema of the data warehouse using the tables in the `staging` schema.

All our pipelines will make use of Dependency Injection (DI) to simplify testing. For the uninitiated, DI is a design pattern where side effects are encapsulated into special objects. Whenever a functions needs to produce a specific side effect it asks for the object that encapsulates it as a parameter. To illustrate, assume the following function:

```python
import cache
import server

def is_user_tall(user_id):
    user = cache.get(user_id)
    if user is None:
        user = server.get(user_id)
    return user.height >= 2.0
```

Testing this function would be hard, as it is making calls to a `cache` object, and a `server`. We can rewrite it as follows:

```python
def is_user_tall(cache, server, user_id):
    user = cache.get(user_id)
    if user is None:
        user = server.get(user_id)
    return user.height >= 2.0
```
Its behaviour is the same, so as long as we remember to pass the `cache` and the `server`, nothing should break in our application. On the other hand, this makes testing easier, as we can effectively mock the `cache` and the `server` during testing, and write separate tests to verify the correctness of these objects.

Let's begin by establishing a directory structure for our project:

```
src/
    jobs/
        ...
    utils/
        ...
    ...
tests/
    jobs/
        ...
    utils/
        ...
main.py
```

The `main.py` file will serve as the entry point for our application. All files in `src/` will have a corresponding file in `tests/` testing its correctness. We will be using `unittest` to write our tests. This library comes with Python 3, so no setup is required. It automatically discovers tests in your source code by looking for files that start with `test_`. In each file it looks for functions prefixed with `test_` and classes prefixed with `Test`. It will recognize these as the tests and run them.

Each job is gonna be a function that receives a `context` object as input. The `context` object serves as a wrapper for all injected dependencies. In our cases, these dependencies manage interactions with each of the following:
- Google Cloud Storage
- Local Environment (Filesystem / Environment variables)
- `mdbtools`
- Data Warehouse (PostgreSQL)

Let's begin by writing a test for the Local Environment dependency. Specifically, let's test the `get_jobs` function, which reads a comma-separated list of jobs to execute from the `JOBS` env variable, and returns them as a list:

```python
import unittest
from src.utils.environment import Environment

class TestEnvironment(unittest.TestCase):
    environment = None

    def setUp(self):
        self.environment = Environment()

    def test_get_jobs_undefined(self):
        """
        should return empty list if jobs env variable is None (undefined)
        """
        result = self.environment.get_jobs()
        self.assertEqual(result, [])

    def test_get_jobs_defined(self):
        """
        should return list of jobs from comma-separated env variable
        """
        result = self.environment.get_jobs()
        self.assertEqual(result, ["job1", "job2"])
```

Notice that both of these tests cannot pass at the same time, as our tests will run with the `JOBS` env variable either defined or undefined. Moreover, these tests have one big issue: They have side-effects! For our small project this is not a problem, but on a larger project side effects slow down tests considerably, and can break stuff if the developer is not careful. Therefore we want our tests to lack side effects, if only for the sake of sanity.

One solution is to patch calls to `os.environ.get`, to make sure it returns what we want on each specific test without having to look things up in the local system.

```python
import unittest
from unittest.mock import patch
from src.utils.environment import Environment

class TestEnvironment(unittest.TestCase):
    environment = None

    def setUp(self):
        self.environment = Environment()

    @patch(
        "src.utils.environment.os.environ.get",
        lambda key: None
    )
    def test_get_jobs_undefined(self):
        """
        should return empty list if jobs env variable is None (undefined)
        """
        result = self.environment.get_jobs()
        self.assertEqual(result, [])

    @patch(
        "src.utils.environment.os.environ.get",
        lambda key: "job1,job2"
    )
    def test_get_jobs_defined(self):
        """
        should return list of jobs from comma-separated env variable
        """
        result = self.environment.get_jobs()
        self.assertEqual(result, ["job1", "job2"])
```

Now both tests can pass and there are no side effects. All the other tests for injected dependencies follow a similar pattern, so we won't elaborate further on them.

Now let's write a test for `process_raw_dump`. This pipeline's only job is to export tables from a downloaded `.mdb` file and upload them to Google Cloud Storage. Thankfully, we've implemented functions for downloading files from Google Cloud Storage, exporting a whole database and uploading a whole folder to Google Cloud Storage. Moreover, we've already tested that these functions work. Therefore, for this pipeline we only need to test that these functions are being called appropiately and in the correct order. The final result looks like this:

```python
import unittest
from unittest.mock import call, Mock
from src.jobs.process_raw_dump import process_raw_dump

class TestProcessRawDump(unittest.TestCase):
    def test_process(self):
        """
        should correctly process the mdb dump in cloud storage and upload the exported csvs
        """
        context_calls = []
        context = Mock()
        context.environment.create_blank_directory.side_effect = \
            lambda dirname: context_calls.append(("environment.create_blank_directory", dirname))
        context.cloud.download_file.side_effect = \
            lambda bucket, filename: context_calls.append(("cloud.download_file", bucket, filename))
        context.mdbtools.dump_tables.side_effect = \
            lambda filename, folder_path: context_calls.append(("mdbtools.dump_tables", filename, folder_path))
        context.cloud.upload_bucket.side_effect = \
            lambda bucket: context_calls.append(("cloud.upload_bucket", bucket))

        process_raw_dump(context)

        expected_calls = [
            ("environment.create_blank_directory", "mdb_store"),
            ("environment.create_blank_directory", "csv_tables_store"),
            ("cloud.download_file", "mdb_store", "MTrakTo.mdb"),
            ("mdbtools.dump_tables", "mdb_store/MTrakTo.mdb", "csv_tables_store"),
            ("cloud.upload_bucket", "csv_tables_store")
        ]

        self.assertListEqual(context_calls, expected_calls)
```

We could've gone the extra mile to mock Google Cloud, and tested whether the `.csv` files in the mocked Google Cloud are correct at the end of the job. We've finally opted not to, as this would've been cumbersome to write, instead opting for tests that leak elements of our implementation. In the end, software engineering is about tradeoffs, and in this case we choose to have leaky tests for the sake of simpler testing.

The tests for the other pipelines follow a similar pattern, so they are not worth discussing.

# Building our Data Pipelines

Finally, building our data pipelines is relatively trivial. The first part is building a framework to run our pipelines. We implement a `Runner` class where we register the jobs and our context object. This API works as follows:

```python
from src.jobs.populate_warehouse import populate_warehouse
from src.jobs.process_csv_dump import process_csv_dump
from src.jobs.process_raw_dump import process_raw_dump
from src.utils.runner import Runner
from src.utils.context import Context

runner = Runner()
runner.register_job("process_raw_dump", process_raw_dump)
runner.register_job("process_csv_dump", process_csv_dump)
runner.register_job("populate_warehouse", populate_warehouse)

context = Context()
runner.set_context(context)

runner.run_jobs()
```

Finally, we want to be able to dynamically change the jobs we want to run. In particular, we want to be able to run commands like:

```bash
$ JOBS=process_csv_dump,populate_warehouse python3 ./main.py
```

and have the framework run only thos jobs. To this effect we implement a simple `run_jobs` function that takes no arguments and handles the logic of reading the `JOBS` environment variable and triggering the right jobs. All of this is also implemented using the TDD paradigm to assure the correctness of our implementation.

The final part is implementing our data pipelines. There is nothing to note about this process, so if the reader is interested in them, their implementation can be found in the source code for the project.

# Up Next

Now that our data warehouse is populated, we have most of the required infrastructure in place. We're only missing a Business Intelligence tool in our stack. In [Part 4](/posts/from-zero-to-data-ready-part-4/) we will build it using CubeJS. Stay tuned!