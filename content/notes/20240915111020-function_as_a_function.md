+++
title = "Function as a Function"
author = ["Andrés Navarro Pedregal"]
date = 2024-09-22T00:00:00+02:00
tags = ["literature", "cloud"]
draft = false
+++

[Paper](/ox-hugo/function_as_a_function.pdf), [DOI Link](https://doi.org/10.1145/3620678.3624648)

Authors: [Tom Kuchler]({{< relref "20240823230003-tom_kuchler_doctorate_student_at_computer_science_ethz.md" >}}), Michael Giardino, Timothy Roscoe, and [Ana Klimovic]({{< relref "20240728152739-ana_klimovic_assistant_professor_eth_computer_science.md" >}})

Dandelion is proposed, a clean-slate [FaaS]({{< relref "20240821105038-function_as_a_service_faas.md" >}}) system that treats [serverless]({{< relref "20240818094228-serverless.md" >}}) functions as pure functions separating computation and I/O.

-   Enables lightweight yet secure function execution system.
-   Makes functions more amenable to hardware acceleration.
-   Enabled dataflow-aware function orchestration.
