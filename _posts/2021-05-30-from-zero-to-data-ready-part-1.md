---
title: From zero to data ready (Part 1)
date: 2021-05-30
tags: [Data Engineering, Retail Project]     # TAG names should always be lowercase
image:
    src: /assets/img/planning.jpg
    alt: Planning
---

Data science has been all the rage for a while. This is no accident: data science, done well, provides insights that give businesses the competitive edge you need nowadays to survive. What very few ever stop to think about is the infrastructure needed to perform data science at scale. Often, data is held in legacy databases or disparate data sources. Data is also often dirty, i.e. it is not suitable for data science workloads. It is the **Data Engineer**'s job to build this infrastructure in the first place, and to get data to be as usable as possible, for interested parties.

In this set of posts I'll outline a brief overview of how to get from no data infrastructure in place, to having data ready for consumption. I'll try to keep things very high-level. If you are interested in the nitty-gritty, you can always check out the source code for the final project.

With all of that out of the way, let's begin!

## Problem Description
A family-owned clothing shop wants to dive deeper into their data. They want to understand how their inventory sells, and take actions that will increase their profits. Their POS (Point-Of-Sale) system was developed in the 90s using Microsoft Access 97. Since, it has been updated by several junior developers with no regards for documentation or internal consistency of the data. The end result is that we now have a database with wildly disparate data that we need to normalize for analytical uses.

We initially want to provide our clients with business intelligence dashboards where they can monitor their operation. After that the idea is to extract some nice insights or create predictive models that would improve the business in some measurable way. For now we will restrict the scope of these posts to just the data engineering side of things.

Note that this post will not focus on the data engineering required for large datasets, and more on what data engineering looks like when applied to small businesses. As such the kinds of problems that we will solve in these posts will be less hyper-technical than some might expect.

## Exploratory Data Analysis
Much like in any data science project, data engineering projects start with understanding the data. Specifically we want to know where it is located, what shape it has, how to clean it up, and where to put it once we are done cleaning it. In our case the data comes from a Microsoft Access database. These are embedded SQL databases, which means that all the data is stored in an `.mdb` file in a structured format. Thankfully there is already a toolset for *Nix environments called `mdbtools` which allows us to manipulate these files.

First let's install `mdbtools` in our system (assume we are running Ubuntu LTS):

```bash
$ sudo apt install mdbtools
```

Now, let's assume that our file is named `database.mdb`. Then we can run the following command to list all tables in the database:

```bash
$ mdb-tables -1 database.mdb
```

After running this command we are left with the following list of tables:

```
Copia de Copia de T-Cotizaciones
Copia de T-CotizacionesOriginal
Errores de pegado
Paste Errors
T- % IVA
...
(~150 more tables)
```

Note that the table names are in spanish, as the POS system was developed by spanish-speaking developers. Do not worry! I will try my best to guide you through this process without assumming a spanish-speaking audience.

Continuing from where we left, we can see from the first few table names that some of those tables are either:
- Tables used for internal application procedures that have no impact on the business model
- Data remnants, e.g. data used for testing purposes that was never deleted
- Small dimension tables that hold no day-to-day business data

The first two types of tables are useless to our purposes. The last type might be useful if they are related in some way to the large fact tables that hold day-to-day business data like transactions. So let's start by looking for the fact tables.

Whenever you are doing EDA it is worth asking people who are part of day-to-day operations how their business works. This allows you to build a mental model of the business, and these models usually map really well to how data is stored in a database. From interviewing employees at this company, we were able to figure out the main components of our business model:
- Clients, self-explanatory.
- Invoices, basically an identifier for each sale.
- Barcodes, which act as SKUs for the inventory.
- References, which exist to wrap information that is often shared by SKUs. For example, a green and an orange shirt might be the same in every way except in color and size. In that case they would have the same reference but different barcodes.
- Payments, associated with an invoice.
- Sales, which are each of the SKUs associated with an invoice.
- Inventory, self-explanatory.

After skimming through the table names, we were able to map these tables to the elements of the business model in the following way:

```
Barcodes   -> T-Codigos de barras
References -> T-Referencias
Clients    -> T-Datos cliente
Inventory  -> T-Inventario.csv, T-Inventario dañado
Invoices   -> T-Factura, T-FacturaOriginal, T-Factura cotizacion, T-Factura cotizacion2
Payments   -> T-Formas de pago, T-Formas de pago Cotizaciones
Sales      -> T-Ventas, T-Ventas1, T-Cotizaciones, T-CotizacionesOriginal
```

Now we need to export the data to begin poking through it. For this we can run the command:

```bash
$ mdb-export database.mdb [table name] > [file name].csv
```

This will write our table into a csv file and now we can play with it!

First, we noticed was that these tables were severely denormalized, i.e. that the same data was found in two or more tables. Specifically, the table for barcodes repeated the information from the references table. Therefore, to keep a single source of truth for now on, we will only be looking at barcodes, as they fully describe an item.

Second, data for invoices, payments and sales were split across several files. We found after talking to employees that the invoice table had grown too large and certain reporting functions in the software had stopped working as fast as they had. To solve this, they basically saved all the old data for invoices, payments and sales into backup table, and truncated the existing ones. The end result is that we may have two different invoices with the same id, and we can only tell them apart using the date. Therefore the primary key for invoices will be the tuple (id, date).

Third, payments and sales only have an invoice id attached to them. Knowing that all three tables were reset the same day allow us to map our records to a specific invoice. Once we've mapped them to a particular invoice, we can bring over the date to the payments and sales tables to construct the invoice foreign key.

Finally, inventory is split into normal inventory and damaged inventory. We will merge these two tables into the barcodes table to have an easier to use data model.

Now that we know our fact tables, finding the dimension tables is a trivial matter of skimming through the columns in the fact tables and finding tables from the list that might relate to them.

Now that we understand the data in the source database we will proceed to create a data model for analytical purposes.

## Defining a data model

To keep our data as easy-to-use as possible, we've decided to denormalize all dimensions into our fact tables. To illustrate, if we have the following structure in our database:

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

Now that we are done with our EDA and our data model definition, we have to build repeatable data pipelines that will keep our data in sync with whatever changes occur in the source database. We will cover this in Part 2.