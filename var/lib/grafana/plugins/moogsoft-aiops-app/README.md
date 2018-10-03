## Moogsoft AIOps App

The app enables rich reporting and dashboard features you can access from within Moogsoft AIOps. Get started with the Moogsoft AIOps App as follows:

1. Install the Moogsoft AIOps app.
2. Find the Moogsoft AIOps app in the plugins list and enable it using the following settings:

> __URL:__ <URL for Moogsoft AIOps>  
> __User:__ <graze username>    
> __Password:__ <graze password>

After you have set up the Moogsoft AIOps app, you can access the default dashboard for AIOps:

![image](https://user-images.githubusercontent.com/434655/37357753-7cccf9ae-26e9-11e8-94b0-8b235515c2e0.png)

## Supported version

This Grafana app is only supported from Moogsoft AIOps 7.0 onwards.

## Template variables

To setup templating specify the endpoint name in the query field (of the query variable).

Example: `getTeams` or `getServices`.

In the select dropdowns in the query editor specify the name of the variable with `$` prefix. For example if a variable is named `Team`, specify `$Team` in the teams dropdown, then hit enter key to add the variable. You can now set team filter by using the variable dropdown at the top of the dashboard.
