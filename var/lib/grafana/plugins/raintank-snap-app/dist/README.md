Snap-app is an experimental application to allow Grafana to function as a web-based frontend for [The Snap Telemetry Framework](https://github.com/intelsdi-x/snap).

![](https://cloud.githubusercontent.com/assets/1744971/20331694/e07e9148-ab5b-11e6-856a-e4e956540077.png)

## Current Features
- list Snap tasks running on a the Snap daemon
- start, stop, create and delete tasks
- list metrics available from plugins loaded into the Snap daemon
- Stream metrics using the "watch tasks" functionality, where the metrics collected are pushed to a Grafana panel in real time

## Usage
The app currently includes a Snap datasource.
  - To get started, you will first need to add a datsource of type "Snap DS".
  - In the datasource settings, the URL should be the url of the Snap daemon API (eg. "http://localhost:8181/").
- Next, on an existing or new dashboard, add a graph panel.
- In the query editor ensure the "snap" datasource is being used.
- you can then select an existing task to watch, or create a new task.
  - to create a new task, type the name of the task in the "task name" field
  - select the metrics of interest from the "Metric" field, using the "+" button to add additional metrics
  - on the "actions" line, click "Create" to create the new task.
- Click the "watch" button on the "actions" line to have metrics pushed to the panel in real time.

### Learn More
Snap source and documentation is [available on GitHub](https://github.com/intelsdi-x/snap). We also [wrote a blog post](https://blog.raintank.io/using-grafana-with-intels-snap-for-ad-hoc-metric-exploration/) using this app.
