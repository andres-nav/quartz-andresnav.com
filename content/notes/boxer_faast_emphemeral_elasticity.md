+++
title = "Boxer: FaaSt Ephemeral Elasticity for Off-the-Shelf Cloud Applications"
author = ["Andrés Navarro Pedregal"]
date = 2024-08-22T00:00:00+02:00
tags = ["literature", "cloud"]
draft = false
+++

[Paper](/ox-hugo/boxer_faast_ephemeral_elasticiy_for_off_the_shelf_cloud_applications.pdf), [DOI Link](https://doi.org/10.48550/arXiv.2407.00832), [Youtube Link](https://www.youtube.com/watch?v=4zb4sA8OVJI)

Authors: [Michael Wawrzoniak]({{< relref "20240824110625-michael_wawrzoniak_past_ph_d_in_computer_software_ethz.md" >}}), Rodrigo Bruno, [Ana Klimovic]({{< relref "20240728152739-ana_klimovic_assistant_professor_eth_computer_science.md" >}}), and  [Gustavo Alonso]({{< relref "20240728145358-gustavo_alonso_full_professor_eth_computer_science.md" >}})

The goal is to **run applications across traditional VMs and [FaaS]({{< relref "20240821105038-function_as_a_service_faas.md" >}}) instances** without requiring changes in the application.
**[Ephemeral elasticity]({{< relref "20240822100645-ephemeral_elasticity.md" >}}) with [FaaS]({{< relref "20240821105038-function_as_a_service_faas.md" >}})** is proposed using a custom tool called Boxer to provide a familiar distributed model (i.e., POSIX-style [network-of-hosts]({{< relref "20240822100343-network_of_hosts.md" >}})), which generic applications expect, on top of existing [FaaS]({{< relref "20240821105038-function_as_a_service_faas.md" >}}) platforms.


## Motivation {#motivation}

Today's VMs are insufficient to react to sudden load spikes or VM failures as their deploy time is in the order of minutes.
Moreover, allocating new resources for a 'fast starting' container takes _tens of seconds_.
As this methods are slow to respond to load spikes or failures, users often resort to **over-provisioning of resources** to provide the illusion of high elasticity which lead to **higher costs**.

On the other hand, [FaaS]({{< relref "20240821105038-function_as_a_service_faas.md" >}}) platforms, such as Azure Functions and [AWS Lambda]({{< relref "20240821110408-aws_lambda.md" >}}) offer high elastic computer pools that automatically scale based on the number of tasks invoked.

However, although it offers high elasticity, current FaaS implementation have constrained execution environment (execution time and VM size) and are based on an event-triggered programming model which makes them unfit to run general-purpose cloud applications off-the-shelf.

Existing FaaS platforms force applications to be written as a collection of short-lived, stateless functions, which cannot accept network connections while executing.


## Introduction {#introduction}

The paper focuses on providing ephemeral usage of [FaaS]({{< relref "20240821105038-function_as_a_service_faas.md" >}}) to absorb load spikes and accommodate sudden failure recovery as long-running VMs still provide a cost advantage for running entire applications.

A new type of [elasticity]({{< relref "20240821111823-elasticity.md" >}}) is proposed, refereed as [ephemeral elasticity]({{< relref "20240822100645-ephemeral_elasticity.md" >}}) for affordable and highly elastic cloud infrastructures.

A file:///home/god/MEGA/2_attachments/d9/87776e-5278-4331-8512-b7e171ab15c8/boxer_faast_ephemeral_elasticiy_for_off_the_shelf_cloud_applications.pdf to see the viability of this approach and the results where that costs could be reduced.


## Boxer {#boxer}

Boxer is an interposition layer spanning VMs and AWS Lambda, that intercepts application execution and emulates the [network-of-hosts environments]({{< relref "20240822100343-network_of_hosts.md" >}}) so applications can be deployed in VMs or FaaS services without any changes.

It does not require changes to the application and integrates with orchestration tools such as [Docker Compose]({{< relref "20240821111339-docker_compose.md" >}}).

It works by intercepting system C Library function calls and emulates the necessary [network-of-hosts environment]({{< relref "20240822100343-network_of_hosts.md" >}}) (network, file system, name resolution) that applications expect when deployed in a VM/container environment.


### Limitations {#limitations}

Current implementation of the process monitor relies on the lightweight dynamic linking mechanism for interposition, which cannot handle applications issuing system calls directly.

It has only been tested in [AWS]({{< relref "20240526122629-aws.md" >}}).

The interface have complex semantics and, combined with the additional constraints, makes handling all of the cases challenging.
