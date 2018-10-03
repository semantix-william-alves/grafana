# Blueflood plugin for grafana

Plugin to use Blueflood or [Rackspace Metrics](https://support.rackspace.com/how-to/rackspace-metrics-overview/) as a datasouce with Grafana 3.x.

## Pre-Requisites

This plugin requires [graphite-api](http://graphite-api.readthedocs.io/en/latest/) with [Blueflood finder](https://github.com/rackerlabs/blueflood-graphite-finder) as a service. You can setup this by running the [rackerlabs/graphite-api-blueflood-finder](https://hub.docker.com/r/rackerlabs/graphite-api-blueflood-finder/) docker image as container. For more instructions on blueflood finder, refer [Blueflood finder](https://github.com/rackerlabs/blueflood-graphite-finder)

## Blueflood datasource

[Blueflood](https://github.com/rackerlabs/blueflood) is an open source multi-tenant, distributed metric processing system. Blueflood is capable of ingesting, rolling up and serving metrics at a massive scale. It is built on top of [Apache Cassandra](http://cassandra.apache.org/), 

## Rackspace metrics datasource

[Rackspace Metrics](https://support.rackspace.com/how-to/rackspace-metrics-overview/) is a multi-tenant software-as-a-service (SaaS) product that offers a flexible and affordable platform for storing and serving time-series metrics. It provides a REST API for metrics ingestion and retrieval.  [Rackspace Metrics](https://support.rackspace.com/how-to/rackspace-metrics-overview/) is built upon [Blueflood](https://github.com/rackerlabs/blueflood).

## Source code
This source code of this plugin is located at  [https://github.com/rackerlabs/blueflood-grafana](https://github.com/rackerlabs/blueflood-grafana). Contributions can be made to the original source code.

## References
* [blueflood-grafana](https://github.com/rackerlabs/blueflood-grafana)
* [Blueflood finder](https://github.com/rackerlabs/blueflood-graphite-finder)
* [http://blueflood.io/](http://blueflood.io/)
* [Rackspace metrics](https://support.rackspace.com/how-to/rackspace-metrics-overview/)
