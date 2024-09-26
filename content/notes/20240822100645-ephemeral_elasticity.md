+++
title = "Ephemeral Elasticity"
author = ["Andrés Navarro Pedregal"]
date = 2024-08-22T00:00:00+02:00
tags = ["cloud"]
draft = false
+++

It refers to a new type of computing [elasticity]({{< relref "20240821111823-elasticity.md" >}}) proposed in the [Boxer: FaaSt Ephemeral Elasticity for Off-the-Shelf Cloud Applications]({{< relref "boxer_faast_emphemeral_elasticity.md" >}}) paper.

Ephemeral elasticity is running applications across both VM/containers as well as FaaS with the goal of having a single orchestrated application deployment that takes advantage of both types of infrastructure.

Thus, ephemeral elasticity is proposed for affordable and highly elastic cloud infrastructures.


## Why it is not available today? {#why-it-is-not-available-today}

Currently, [FaaS]({{< relref "20240821105038-function_as_a_service_faas.md" >}}) and VMs/containers operate under two different models.


### [Network of hosts]({{< relref "20240822100343-network_of_hosts.md" >}}) {#network-of-hosts--20240822100343-network-of-hosts-dot-md}


### [Event-triggered model]({{< relref "20240821105038-function_as_a_service_faas.md" >}}) {#event-triggered-model--20240821105038-function-as-a-service-faas-dot-md}
