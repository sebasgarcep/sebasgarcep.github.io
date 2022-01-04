---
title: From Zero to Data-Ready (Part 1)
date: 2021-05-30
tags: [Data Engineering, Retail Project, From Zero to Data-Ready, Exploratory Data Analysis, Python, mdbtools]
image:
    src: /assets/img/2021-05-30-from-zero-to-data-ready-part-1/planning.jpg
    alt: Planning
---

Data science has been all the rage for a while. This is no accident: data science, done well, provides insights that give businesses the competitive edge you need nowadays to survive. What very few ever stop to think about is the infrastructure needed to perform data science at scale. Often, data is held in legacy databases or comes from disparate data sources. Data is also often dirty, i.e. it is not suitable for data science workloads. It is the **Data Engineer**'s job to build the infrastructure, clean the data and make it available to users.

In this set of posts I'll outline how to build a simple data architecture. I'll try to keep things very high-level. If you are interested in the nitty-gritty, you can always check out the source code that I'll provide at the end of each post.

With all of that out of the way, let's begin!

## Problem Description
A family-owned clothing shop wants to dive deeper into their data. They want to understand how their inventory sells, and take actions that will increase their profits. To achieve this we want to provide our clients with business intelligence dashboards where they can monitor their operation.

Their POS (Point-Of-Sale) system was developed in the 90s using Microsoft Access 97. It has since been updated by several junior developers with no regards for documentation or internal consistency of the data. The end result is that we now have a database with wildly disparate data that we need to normalize for analytical uses. This is not a made-up scenario, but one that is all too common for small businesses.

Note that this post will not focus on the data engineering required for large datasets. As such the kinds of problems that we will solve in these posts will be less hyper-technical than some might expect. Nevertheless, they are a great way to get into the data engineering mindset.

## Exploratory Data Analysis
Much like in any data science project, data engineering projects start with understanding the data. Specifically we want to know where it is located, what shape it has, how to clean it up, and where to put it once we are done cleaning it. In our case the data comes from a Microsoft Access database. This is an embedded SQL databases, which means that all the data is stored in an `.mdb` file in a structured format. Thankfully there is already a toolset for *Nix environments called `mdbtools` which allows us to manipulate these files.

First let's install `mdbtools` in our system (assume we are running Ubuntu LTS):

```bash
sudo apt install mdbtools
```

Now, let's assume that our file is named `database.mdb`. Then we can run the following command to list all tables in the database:

```bash
mdb-tables -1 database.mdb
```

After running this command we are left with a list of tables. In the case of the application we are working on, we see that some of these tables are:
- Tables used for internal application procedures that have no impact on the business model
- Data remnants, e.g. tables used for testing purposes that were never deleted
- Small dimension tables that hold no day-to-day business data

The first two types of tables are useless for our purposes. The last type might be useful if they are related in some way to the large fact tables that hold day-to-day business data like transactions. So let's start by looking for these fact tables.

Whenever you are doing EDA it is worth asking people who are part of day-to-day operations how their business works. This allows you to build a mental model of the business, and these models usually map really well to how data is stored in a database. From interviewing employees at this company, we were able to figure out the main components of the business model:
- Clients, self-explanatory.
- Invoices, basically an identifier for each sale.
- Barcodes, which act as SKUs for the inventory.
- References, which exist to wrap information that is often shared by SKUs. For example, a green and an orange shirt might be the same in every way except in color and size. In that case they would have the same reference but different barcodes.
- Payments, associated with an invoice.
- Sales, which are each of the SKUs associated with an invoice.
- Inventory, self-explanatory.

After skimming through the table names, we were able to map these to the elements of the business model. Now we need to export the data to begin poking through it. For this we can run the command:

```bash
mdb-export database.mdb [table name] > [file name].csv
```

This will write our table into a csv file and now we can play with it! I'm going to use Jupyter Notebook to perform the EDA. The reasons are twofold. Firstly, doing EDA on Jupyter Notebook + Python using Pandas is relatively straightforward. Secondly, we are planning to write our ETLs on raw Python as our data is very small. This means that we can reuse whatever code we write here in the next step of our process.

After doing our EDA we came to the following conclusions:
- Tables were severely denormalized, i.e. that the same data was found in two or more tables. Specifically, the table for barcodes repeated the information from the references table. Therefore, to keep a single source of truth for now on, we will only be looking at barcodes, as they fully describe an item.
- Data for invoices, payments and sales were split across several files. We found after talking to employees that the invoice table had grown too large and certain reporting functions in the software had stopped working as fast as they had. To solve this, they basically saved all the old data for invoices, payments and sales into backup table, and truncated the existing ones. The end result is that we may have two different invoices with the same id, and we can only tell them apart using the date. Therefore the primary key for invoices will be the tuple (id, date).
- Payments and sales only have an invoice id attached to them, there's no date field in these tables. Thus at first it may seem like there is no way to map them to an invoice. But all tables were truncated the same day which allows us to map payments and sales to invoice by mapping old payments/sales to old invoices and new payments/sales to new invoices. Once we've mapped them to a particular invoice, we can bring over the date to the payments and sales tables to construct the invoice foreign key.
- Inventory is split into normal inventory and damaged inventory. We will merge these two tables into the barcodes table to obtain a simpler data model.

Now that we know our fact tables, finding the dimension tables is a trivial matter of skimming through the columns in the fact tables and finding tables from the `mdb-tables` output that might relate to them. With all of this, we can proceed to create a data model for analytical purposes.

## Defining a data model

To keep our data as simple as possible, we've decided to denormalize all dimensions into our fact tables. To illustrate, if we have the following structure in our database:

### Source DB Dimension Table
- id
- desc

### Source DB Fact Table
- id
- date
- dim_id

We will transform it into the following structure:

### Result Fact Table
- id
- date
- dim_id
- dim_desc

The final result of whatever ETL processes we end up building later on should be a set of five tables: `clients`, `barcodes`, `invoices`, `payments` and `sales`. These tables, even though they do not map one-to-one to the source database schema, they map one-to-one to the business model we inferred from talking to employeees. The schema is as follows:

### clients
- id
- name
- address
- city
- email
- work_phone
- cellphone
- neighborhood
- birthday
- home_phone

### barcodes
- barcode
- reference
- clothing_type_id
- clothing_type_description
- gender_id
- gender_description
- silhouette_id
- silhouette_description
- color_id
- color_description
- size_id
- size_description
- quantity
- damaged

### invoices
- id
- date
- time
- salesperson_id
- salesperson_description
- client_id

### payments
- invoice_id
- invoice_date
- type
- amount

### sales
- invoice_id
- invoice_date
- barcode
- discount_percentage
- price

## Up next

Now that we are done with our EDA and our data model definition, we have to build repeatable data pipelines that will keep our data in sync with whatever changes occur in the source database. We will cover this in [Part 2](/posts/from-zero-to-data-ready-part-2/).