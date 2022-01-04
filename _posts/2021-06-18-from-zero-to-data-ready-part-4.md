---
title: From Zero to Data-Ready (Part 4)
date: 2021-06-18
tags: [Data Engineering, Retail Project, From Zero to Data-Ready]
image:
    src: /assets/img/2021-06-18-from-zero-to-data-ready-part-4/dashboard.jpg
    alt: Dashboard
---

In [Part 3](/posts/from-zero-to-data-ready-part-3/) we wrote our ETLs using Python and TDD. In this post we will focus on building an analytics platform for the company using CubeJS.

# What is CubeJS ?

CubeJS is a tool that serves as a backend for data analytics. To put it into context, if you have a data warehouse and a dashboard then CubeJS can serve as an intermediary between both. All it requires is a data model definition. With just this you can build declarative visualizations on the frontend, and it will take the responsibility of building and resolving the required queries in the data warehouse.

# Setting up CubeJS

To start using CubeJS you require NodeJS, and access to a compatible database, in our case Postgres. Once you have that, head over [here](https://cube.dev/docs/getting-started/nodejs) and follow the instructions to setup cubejs for your system. Once you have that, we can launch the CubeJS playground using:

```
$ npm run dev
```

# Implementing our Data Model

Let's implement our data model. As we discussed in previous posts, our data model have five main entities: Barcodes, Clients, Invoices, Payments, Sales. We will show now how to implement one of them, the other will be analogous.

Let's implement invoices. We can start by creating a file in the `schema/` subdirectory called `Invoices.js`. CubeJS schema definition API is a function that requires two arguments: the name of the table, and an object defining its properties. It looks something like this:

```javascript
cube('Invoices', {
    ...
})
```

Inside this object let's define the base query:

```javascript
cube('Invoices', {
    ...
     sql: `
        SELECT
            id
            ,date
            ,salesperson_id
            ,salesperson_description
            ,(date + time) AS time
            ,client_id
        FROM invoices
     `
    ...
})
```

This will tell CubeJS how to get this table from the database. Notice that `sql` can be any arbitrary query, so if your analytical entity requires JOINs with many tables, CubeJS can support that!

Now let's tell CubeJS how this table relates to others. This is important as we are often querying our objects but using filters from related tables. There are three types of relationships: `hasMany` and `belongsTo`, which define, respectively, both sides of a one-to-many relationship; `hasOne` which defines any side of a one-to-one relationship. With this in mind, our relationship definition will look like:

```javascript
cube('Invoices', {
    ...
    joins: {
        Clients: {
            relationship: 'belongsTo',
            sql: `${Invoices}.client_id = ${Clients}.id`,
        },

        Payments: {
            relationship: 'hasMany',
            sql: `${Invoices}.id = ${Payments}.invoice_id AND ${Invoices}.date = ${Payments}.invoice_date`,
        },

        Sales: {
            relationship: 'hasMany',
            sql: `${Invoices}.id = ${Sales}.invoice_id AND ${Invoices}.date = ${Sales}.invoice_date`,
        },
    },
    ...
})
```

where each entry in the `joins` object is the name of the table related to this one, the `relationship` attribute will define the type of relationship these tables have, and `sql` will tell us how to join both tables.

We now have to define measures. For the case of invoices we defined only one measure: `count`. In CubeJS, count measures are very easy to implement:

```javascript
cube('Invoices', {
    ...
    measures: {
        count: {
            type: 'count',
        },
    },
    ...
})
```

You can also implement other types of measures. At the time of writing CubeJS supports the following measure types: `number` (arbitrary measure calculated using SQL), `count`, `countDistinct`, `countDistinctApprox`, `sum`, `avg`, `min`, `max`, `runningTotal`. An example of a complex `sum` measure can be found in the `Sales` table:

```javascript
cube('Sales', {
    ...
    measures: {
        total_revenue: {
            type: 'sum',
            sql: 'price * (1 - discount_percentage)',
            format: 'currency',
        },
    },
    ...
})
```

where sql defines the expression over which the sum occurs. Notice that we can format our measures to display in the appropiate way to the end-user.

Finally we need to define dimensions. They act as the filters over our tables. For our case, the dimensions look the following way:

```javascript
cube('Invoices', {
    ...
    dimensions: {
        surrogate_key: {
            type: 'string',
            sql: `${Invoices}.id || '-' || ${Invoices}.date`,
            primaryKey: true,
        },

        id: {
            type: 'number',
            sql: 'id',
        },

        salesperson_id: {
            type: 'number',
            sql: 'salesperson_id',
        },

        salesperson_description: {
            type: 'number',
            sql: 'salesperson_description',
        },

        time: {
            type: 'time',
            sql: 'time',
        },
    },
    ...
})
```

With CubeJS there is a caveat when it comes to dimensions. For every table, we must define a primary key by setting the `primaryKey` attribute to `true` on one of the dimensions.

In that case of invoices, the primary key is the tuple `id`, `date`. Because CubeJS does not support compound primary keys, we need to create a dimension based on an expression instead of on a column reference and use that as a primary key. Thankfully, this is trivial to do in CubeJS as the `sql` attribute supports arbitrary expressions:

```javascript
surrogate_key: {
    type: 'string',
    sql: `${Invoices}.id || '-' || ${Invoices}.date`,
    primaryKey: true,
},
```

# Building a Dashboard

Now that we have a working data model for our server, we can run the CubeJS playground. Here we get three tabs, `Build`, `Dashboard App`, and `Schema`.

In `Schema` you can look at the raw tables of your database and autogenerate the schema files we manually wrote in the last section using metadata like data types, primary keys and foreign keys. This is very useful if you have a large data warehouse already and want to rapidly migrate to CubeJS. You can also look at the contents of the schema definitions if you ever need a quick refresher of their contents.

In `Build` we can construct visualizations using a GUI. This is very similar to how a business intelligence tool like Power BI works, with the advantage that we also get the frontend code for the visualization (which we can copy and paste into our dashboard), and the SQL code that this visualization will ultimately run in the data warehouse. There's also an `Add to Dashboard` option, which allows us to automatically add any visualization we create here to our dashbboard.

![Build Tab in CubeJS](/assets/img/2021-06-18-from-zero-to-data-ready-part-4/build-cubejs.png)

Finally, `Dashboard App` gives us the option to build our dashboard in React, Angular or Vue, using a variety of charting libraries, and with the option to either allow or disallow the end-user from creating their own visualizations.

Given that our clients have no technical expertise we will build a static dashboard, i.e. one that does not allow modifications from end-users. In our case we have a lot of expertise with React, so it makes sense to scaffold a dashboard project that uses React, Material UI and Recharts.

Most of the work was already done by the scaffolding tool, but there was one aspect that it did not solve: filtering. Our clients want to have filters at the top of the page, and the dashboard underneath it. Building the filters is relatively straightforward as Material UI has all the fields and pickers you may need. The main problem is that both the header and the dashboard need to know what the filter context is, and the header needs to be able to update it.

To make sure that the filter context is shared by both the header and the dashboard, we need to build a stateful React context and a React component to act as a context provider to the application. We'll spare the details of how to achieve this, as it goes outside the scope of CubeJS, but there is a great example [here](https://www.w3school.info/2021/06/05/react-context-api-with-hooks-to-make-stateful-application/).

After these steps our application is working, and all that we need to hand this over to a client is to polish the design.

![Dashboard Prototype](/assets/img/2021-06-18-from-zero-to-data-ready-part-4/dashboard-prototype.png)

# Conclusion

In this series of posts we explored a possible architecture for a data infrastructure, and how to build it while following best practices. I hope that the reader can take some inspiration from this. Building data infrastructures doesn't have to be hard!