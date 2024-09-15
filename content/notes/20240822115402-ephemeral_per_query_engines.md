+++
title = "Ephemeral per-query engines"
author = ["Andrés Navarro Pedregal"]
date = 2024-08-24T00:00:00+02:00
tags = ["cloud"]
draft = false
+++

Query engines that are dynamically instantiated for each query and discarded upon competition.

Goal: select the optimal engine and configuration on a per-query basis to eliminated inefficiencies of all-purpose configurations and resource overprovisioning.

This opens up the possibility to use different engines depending on factors like:

-   Data types (e.g., relational, semi-structured, graphs)
-   File formats (e.g., Arrow, Parquet, CVS, JSON, etc.)
-   Expected performance (e.g., based on previous profiling)
-   Feature set (e.g., availability of required statistical functions)
