+++
title = "MetaQ: Ephemeral Per-query Engines for Serverless Analytics"
author = ["Andrés Navarro"]
date = 2024-08-24T00:00:00+02:00
tags = ["paper", "cloud"]
draft = false
+++

[Paper](/ox-hugo/ephemeral_per_query_engines.pdf), [DOI Link](https://doi.org/10.3929/ethz-b-000646165)

Authors: [Michael Wawrzoniak]({{< relref "20240824110625-michael_wawrzoniak_past_ph_d_in_computer_software_ethz.md" >}}), Rodrigo Bruno, [Ana Klimovic]({{< relref "20240728152739-ana_klimovic_assistant_professor_eth_computer_science.md" >}}), and [Gustavo Alonso]({{< relref "20240728145358-gustavo_alonso_full_professor_eth_computer_science.md" >}})

This paper, proposes the MetaQ, a proof of concept design of the [EPQE paradigm]({{< relref "20240822115402-ephemeral_per_query_engines.md" >}}).
The goal is to to **run unmodified data processing engines on [serverless]({{< relref "20240818094228-serverless.md" >}}) [FaaS]({{< relref "20240821105038-function_as_a_service_faas.md" >}}) platforms** and show that the services can be instantiated on demand when queries arrive.


## Motivation {#motivation}

Long-running query engines have several limitations:

-   They incur costs even if they are idle.
-   Most distributed query engines lack [elasticity]({{< relref "20240821111823-elasticity.md" >}}), which leads to over-provisioned deployments.
-   As workload diversity increases, each query might benefit from a different configuration and/or engine deployment (e.g., involving accelerators, caches, parallelism level, etc.), resulting in queries running in a less than optimal setting.
