+++
title = "Rethinking Serverless Computing: from the Programming Model to the Platform Design"
author = ["Andrés Navarro Pedregal"]
date = 2024-09-16T00:00:00+02:00
tags = ["literature", "cloud", "data-analytics", "serverless"]
draft = false
+++

[Paper](/ox-hugo/rethinking_serverless.pdf), [Semantic Scholar Link](https://www.semanticscholar.org/paper/Rethinking-Serverless-Computing%3A-from-the-Model-to-Alonso-Klimovic/94d95b1a5582bf381664c82301344ffb9133316e),

Authors: [Gustavo Alonso]({{< relref "20240728145358-gustavo_alonso_full_professor_eth_computer_science.md" >}}), [Ana Klimovic]({{< relref "20240728152739-ana_klimovic_assistant_professor_eth_computer_science.md" >}}), [Tom Kuchler]({{< relref "20240823230003-tom_kuchler_doctorate_student_at_computer_science_ethz.md" >}}), and [Michael Wawrzoniak]({{< relref "20240824110625-michael_wawrzoniak_past_ph_d_in_computer_software_ethz.md" >}})

[Serverless]({{< relref "20240818094228-serverless.md" >}}) offers advantages over traditional VMs (e.g., greater elasticity, simplicity of use and management, finer granularity billing, and rapid deployment and start up times).

The current state of [serverless]({{< relref "20240818094228-serverless.md" >}}) is studied and what is missing to make it better in general and for data analytics.


## Benefits of serverless {#benefits-of-serverless}

For the user:

-   Automatic infrastructure management: as the platform manages the resources and scales automatically.
-   Minimize costs: pay only for what you use.
-   Automatic elasticity: easily deal with large number of parallel tasks.

For the provider:

-   Efficient resource utilization: the platform can pack multiple functions on the same machine.
-   Higher level of abstraction: opportunity to optimize the platform for the specific workload.

For the researcher:

-   Improved startup time
-   Facilitating data sharing
-   Workflows of functions to implement complex functionality
-   Better hardware support


## Data analytics with serverless {#data-analytics-with-serverless}

Challenges

-   Lack of direct communication between functions
-   Lack of support for stateful functions
-   Restricted execution time
-   Limited configuration options between compute and memory
-   **Serverless is only a good fit for very low throughput (e.g., 1-10 requests per second)**

    Proposed solutions
-   Workarounds: (e.g., [Starling](https://arxiv.org/abs/1911.11727) and [Lambada](https://arxiv.org/abs/1912.00937))
-   Caching layers to maintain state
-   Proxies to facilitate communication between functions
-   Limited forms of communication
-   Improving scalability for concrete applications


## Currently reading point 3 {#currently-reading-point-3}
