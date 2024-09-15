+++
title = "Imaginary Machines: A Serverless Model for Cloud Applications"
author = ["Andrés Navarro Pedregal"]
date = 2024-08-22T00:00:00+02:00
tags = ["paper", "cloud"]
draft = false
+++

[Paper](/ox-hugo/imaginary_machines_a_serverless_model_for_cloud_applications.pdf), [DOI Link](https://doi.org/10.48550/arXiv.2407.00839)

Authors: [Michael Wawrzoniak]({{< relref "20240824110625-michael_wawrzoniak_past_ph_d_in_computer_software_ethz.md" >}}) , Rodrigo Bruno , [Ana Klimovic]({{< relref "20240728152739-ana_klimovic_assistant_professor_eth_computer_science.md" >}}) , [Gustavo Alonso]({{< relref "20240728145358-gustavo_alonso_full_professor_eth_computer_science.md" >}})

Proposes with the goal of applying the serverless paradigm to cloud applications designed for networked VMs.

The goal is to **increase resource utilization while reducing management costs**.

It uses [Boxer]({{< relref "20240815094638-boxer_faast_ephemeral_elasticity_for_off_the_shelf_cloud_applications.md" >}}).


## Motivations {#motivations}

The current options in cloud are divided currently in two strict categories:

-   Renting VMs on-demand: which provide lower level of resource [elasticity]({{< relref "20240821111823-elasticity.md" >}}), and users need to manage the infrastructure at run-time.
-   Using a [FaaS]({{< relref "20240821105038-function_as_a_service_faas.md" >}}) model with limitation posed by [serverless]({{< relref "20240818094228-serverless.md" >}}).

So, a new model is studied to figure out the feasibility of getting the best of both categories.


## Imaginary Machines {#imaginary-machines}

A [serverless]({{< relref "20240818094228-serverless.md" >}}) execution model of cloud applications that:

-   From the app perspective, all possible (configured) hosts are already instantiated.
    The cloud application processes run them "imagining" that the network destinations are already available and running.
    That is it exposes the highly elastic resource of [serverless]({{< relref "20240818094228-serverless.md" >}}) platforms as the traditional [network-of-hosts]({{< relref "20240822100343-network_of_hosts.md" >}}) model.

-   From the platform perspective, the system must support a programming model that enables the app perspective.
    But it also need to perform on-demand, automatic, transparent, and fine-grained resource orchestration for the app.

It eliminates the need for explicit run-time orchestration by transparently managing application resources based on signals generated during cloud application executions.
