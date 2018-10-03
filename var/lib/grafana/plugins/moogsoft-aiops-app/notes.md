## Notes for how to update dashboards

After making the modifications to a dashboard to to dashboard settings > View JSON. Copy the JSON and paste it
in the json file of the dashboard you want to update (in this repo located under src/dashboards).

Edit the json:

- Remove the `id` property
- Update or add (if missing) a `revision` propery. Needs to be a number and increase by 1 if your updating an exiting
    dashboard (so its 1 higher than the in the dashboard json you replaced).
- Update app plugin version in src/plugin.json


Adding a new dashboard.

- Update app plugin json in src/plugin.json
- Add a new dashboards entry


