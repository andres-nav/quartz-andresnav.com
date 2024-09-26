+++
title = "Off-the-shelf Data Analytics on Serverless"
author = ["Andrés Navarro Pedregal"]
date = 2024-08-22T00:00:00+02:00
tags = ["paper", "cloud"]
draft = false
+++

[Paper](/ox-hugo/off_the_shelf_data_analytics_on_serverless.pdf), [Semantic Scholar Link](https://www.semanticscholar.org/paper/Off-the-shelf-Data-Analytics-on-Serverless-Wawrzoniak-Moro/a3122ef3bcbad485034748e0225f9b9c0cfba67a), [DOI Link](https://doi.org/10.3929/ethz-b-000646171)

Authors: Michael Wawrzoniak, Gianluca Moro, Rodrigo Bruno, [Ana Klimovic]({{< relref "20240728152739-ana_klimovic_assistant_professor_eth_computer_science.md" >}}), and [Gustavo Alonso]({{< relref "20240728145358-gustavo_alonso_full_professor_eth_computer_science.md" >}})

**[Serverless]({{< relref "20240818094228-serverless.md" >}}) is not well suited for data analytics** due to the limitations of the current platforms such as short function times, lack of persistent state and direct communication, as well as higher cost per second compared to VMs.

To address this issue, usually two approaches are taken:

-   Extend existing serverless platforms, often with VM-based services, to better support data analytics workloads.
-   Build new engines designed to work around the limitations.

The main problem with this approaches is the implicit give up on the existing distributed data processing platforms (e.g., Spark, Flink, Drill, etc.).

In this paper, the authors explore and propose an alternative solutions for data analytics on serverless.
**Run off-the-shelf distributed data processing platforms (e.g., Spark or Drill) on top of existing commercial serverless platforms ([AWS Lambda]({{< relref "20240821110408-aws_lambda.md" >}})).**

To achieve this, they used [Boxer]({{< relref "boxer_faast_emphemeral_elasticity.md" >}}) to handle unmodified data processing engine processes.
