---
title: "From Zero to Data-Ready (Part 2): Building a SQL Data Warehouse"
date: 2021-05-31
tags: [Data Engineering, Retail Project, From Zero to Data-Ready, Postgres, SQL, sqitch]
image:
    src: /assets/img/2021-05-31-from-zero-to-data-ready-part-2/code.jpg
    alt: Code
---

In [Part 1](/posts/from-zero-to-data-ready-part-1/) we defined our problem, performed some EDA and defined a data model appropiate for data analytic purposes. In this post we will explore how to build a data warehouse and ETLs using Test Driven Development. Without any more preamble, let's start!

## Building a Data Warehouse
A Data Warehouse is a database intended for analytical workloads. Usually, we use products like Redshift or Azure SQL Data Warehouse as our data warehousing layer as they are optimized for queries, unlike traditional RDBMS systems which are optimized for transactional operations. In our case the data is small enough that a Postgres instance can be used instead of a traditional data warehouse. The reason is that while traditional data warehouses are better at complex queries, they are also prohitively expensive, as they often run on top of distributed computing systems.

For this project we've decided to use Google Cloud Platform, but any IaaS provider will work equally well. First, let's spin up a Postgres instance. Ideally, you would want to spin up at least three: one for development, another for QA and the last one for production. For our purposes we will use only one, as this project is demonstrative and we will not be doing any QA or production work. Additionally, we will be using a migration tool for our schema. This implies that no extra work needs to done between deployment environments, and doing something once is good enough for this exercise.

Let's begin by installing `sqitch`, or migration tool:

```bash
sudo apt-get install sqitch libdbd-pg-perl postgresql-client libdbd-sqlite3-perl sqlite3
```

Once we are done with this step we can begin writing our migrations. For people unfamiliar with migrations, they are rerunnable tasks that are meant to update a database's schema. The reason why we use migrations instead of doing stuff directly in the database is that they are repeatable and even testable.

Let's create a folder for our migrations:

```bash
mkdir warehouse
cd warehouse
```

And let's add the following files to this folder:

```bash
# warehouse/sqitch.conf
[core]
    engine = pg
```

```bash
# warehouse/sqitch.plan
%syntax-version=1.0.0
%project=warehouse
```

Now create a few more folders that will hold our migrations
```bash
mkdir deploy
mkdir revert
mkdir verify
```

In `deploy` we will have our traditional migrations. In `revert` we shall have a migration that undoes whatever its corresponding migration in `deploy` does. This is to easily revert changes in production if we find out later down the line that our changes are screwing something up. Finally `verify` should hold scripts that independently validate that its corresponding migration in `deploy` ran correctly. We will not be implementing these, as they are cumbersome to write and add no value to a small project.

In our database we will have two schemas: `staging` and `public`. The first schema is a temporary working space for our ETLs and the latter is where our client-facing tables will end up. The reason for this separation is that we do not want to end up with empty tables while data loads. With this separation we can load data into the staging tables and once data has loaded we can move the data into production inside a transaction. Because transactions inside the same database should run faster than loading data from an external source, the final user should not experience any downtime.

The `public` schema already exists for Postgres instances. Therefore let's write a migration for the staging schema. Run the following command:

```bash
sqitch add staging_schema -n "Add staging schema to database"
```

This creates the needed files in the `deploy`, `revert` and `verify` folders. Now replace the contents of these files with:

```bash
# warehouse/deploy/staging_schema.sql
-- Deploy warehouse:StagingSchema to pg

BEGIN;

CREATE SCHEMA staging;

COMMIT;
```

```bash
# warehouse/revert/staging_schema.sql
-- Revert warehouse:StagingSchema from pg

BEGIN;

DROP SCHEMA staging;

COMMIT;
```

Let's add another set of migrations for one of the staging tables:

```bash
sqitch add staging_barcodes -n "Creates the staging table for barcodes"
```

Now replace the contents of the following files:

```bash
# warehouse/deploy/staging_barcodes.sql
-- Deploy warehouse:StagingBarcodes to pg

BEGIN;

CREATE TABLE staging.barcodes (
	barcode text PRIMARY KEY,
	reference text NULL,
	clothing_type_id int NULL,
	gender_id int NULL,
	silhouette_id int NULL,
	color_id int NULL,
	size_id text NULL
);

COMMIT;
```

```bash
# warehouse/revert/staging_barcodes.sql
-- Revert warehouse:StagingBarcodes from pg

BEGIN;

DROP TABLE staging.barcodes;

COMMIT;
```

To run the migrations we have created, execute the following:

```bash
sqitch deploy --target db:pg://<user>:<password>@<host>:<port>/<dbname>
```

Now you can log into your database instance and you should notice that `staging.barcodes` is there! The rest of the tables will follow a similar pattern, so we will not cover how to do them.

Finally, we need to point out that the denormalization process we covered in Part 1 will occur in the Postgres instance, to take advantage of the database engine for the JOINs. Therefore we will end up with five tables in the `public` schema but have one for each fact and dimension table from the `.mdb` database in the `staging` schema.

## Up next

Now that we have a data warehouse ready to go, we can begin thinking about our ETLs. This will be covered in [Part 3](/posts/from-zero-to-data-ready-part-3/) of the series.

## Sources

- [From Zero to Data Ready project](https://github.com/sebasgarcep/from_zero_to_data_ready)