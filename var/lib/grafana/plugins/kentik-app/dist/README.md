Kentik Connect for Grafana allows you to quickly and easily enhance your visibility into your network traffic. Kentik Connect leverages the power of Kentik Detect, which provides real-time, Internet-scale ingest and querying of network data including flow records (NetFlow, IPFIX, sFlow), BGP, GeoIP, and SNMP. Stored in the Kentik Data Engine (KDE), Kentik Detect’s distributed post-Hadoop Big Data backend, this information is a rich source of actionable insights into network traffic, including anomalies that can affect application or service performance. Kentik Connect provides Grafana with instant access to KDE, enabling you to seamlessly integrate network activity metrics into your Grafana dashboard.

## Features

Kentik Connect for Grafana ships with an official Kentik Data Source, the database connector that allows you to read and visualize data directly from KDE. Within the Grafana environment, you can specify the parameters of the traffic that you want Kentik Connect to display:

- Timespan: set the time range for which you want to see traffic data.
- Devices: view traffic from all devices or individual routers, switches, or hosts.
- Dimensions: group by over 30 source and destination dimensions representing NetFlow, BGP, or GeoIP data.
- Metrics: display data in metrics including bits, packets, or unique IPs.
- Sort: visualizations are accompanied by a sortable table showing Max, 95th percentile, and Average values.

Kentik Connect also allows you to edit the configuration of devices (which must already be registered with Kentik Detect). And, as with any Grafana dashboard, current settings can be managed (Manage dashboard menu) and dashboards can be saved, shared, and starred.

## External Dependencies

- A Kentik account and API key is required to Enable the Kentik app. If you don’t have a Kentik account, [sign up for your Free Trial Now](https://portal.kentik.com/signup.html?ref=signup_2nd&utm_source=grafana&utm_medium=landingpage&utm_term=portal&utm_campaign=grafana-signup).
- To appear in the Kentik Connect device list, devices must first be registered with Kentik Detect.
