---
title: "Research: LLM Frameworks for Saleor AI Integration"
topic: "litellm-saleor"
category: "uncategorized"
status: "draft"
decision_deadline: "2026-03-08"
created: "2026-03-08"
last_modified: "2026-03-08"
authors:
  - "automation"
---

## Findings

# Research: LLM Frameworks for Saleor AI Integration

**Date:** 2026-03-08
**Researcher:** OpenCode Agent
**Status:** COMPLETED

---

## Objective

Research LLM orchestration frameworks (Litellm, LangChain, etc.) for AI-powered operations with Saleor e-commerce platform.

---

## Findings

### LiteLLM Overview

**Repository:** https://github.com/BerriAI/litellm

- Stars: 22.6k+
- Python-based
- Multi-provider support (100+ LLMs)

### Key Features

| Feature            | Description                                     |
| ------------------ | ----------------------------------------------- |
| **Multi-provider** | OpenAI, Anthropic, Azure, Bedrock, Ollama, etc. |
| **Proxy Server**   | AI Gateway with load balancing                  |
| **Cost Tracking**  | Per-request cost monitoring                     |
| **Guardrails**     | Input/output validation                         |
| **Caching**        | Redis caching support                           |
| **MCP Support**    | Built-in MCP server integration                 |

### Use Cases for E-commerce

| Use Case  | LLM Application                                    |
| --------- | -------------------------------------------------- |
| Products  | Auto-generate descriptions, SEO tags, translations |
| Orders    | Status updates, processing automation              |
| Customers | AI support automation                              |
| Marketing | Email campaigns, product copy                      |

### Alternative Frameworks

| Framework      | Pros                            | Cons               |
| -------------- | ------------------------------- | ------------------ |
| **LiteLLM**    | Multi-provider, easy API, proxy | Less agent-focused |
| **LangChain**  | Full agent framework, vector DB | More complex       |
| **LlamaIndex** | Great for RAG                   | Less for agents    |
| **AutoGen**    | Multi-agent systems             | Microsoft-specific |

---

## Recommendations for drdarky.cz

### Recommended: LiteLLM

1. **Why LiteLLM?**
    - Simple unified API
    - Cost tracking essential for AI operations
    - MCP integration built-in
    - Self-hostable proxy server

2. **Provider Options**
    - **Primary:** OpenAI GPT-4o or Anthropic Claude
    - **Backup:** Ollama (local) for cost savings
    - **European:** Configure Azure Europe for GDPR

3. **Architecture**

```
AI Agent → LiteLLM Proxy → LLM Providers
                    ↓
              Cost Tracking
                    ↓
              Langfuse/LLM logging
```

4. **Installation**

```bash
pip install 'litellm[proxy]'
litellm --model gpt-4o
```

### Docker Compose Integration

```yaml
services:
    litellm:
        image: ghcr.io/berriai/litellm:main
        volumes:
            - ./litellm_config.yaml:/app/config.yaml
        ports:
            - "4000:4000"
```

---

## Cost Estimation

| Model      | Input    | Output | Notes               |
| ---------- | -------- | ------ | ------------------- |
| GPT-4o     | $2.50/1M | $10/1M | Recommended         |
| Claude 3.5 | $3/1M    | $15/1M | Good for reasoning  |
| Ollama     | Free     | Free   | Local, no API costs |

---

## References

- https://github.com/BerriAI/litellm
- https://docs.litellm.ai/docs/


Excellent research on the **LiteLLM** framework. It is an ideal choice for **drdarky.cz** because it solves the "multi-model" problem while providing the cost tracking and unified API necessary for a professional e-commerce AI implementation.

---

### 🧠 Strategic Advantage for drdarky.cz

Using **LiteLLM** as an AI Gateway allows you to implement a **Model Fallback Strategy**. For example, if **Claude 3.5 Sonnet** (your primary reasoning model) hits a rate limit or goes down, LiteLLM can automatically failover to **GPT-4o** or a local **Ollama** instance. This ensures your automated order processing never stalls.

#### ⚖️ Framework Comparison for Saleor Integration

| Strategy | Framework | Best Use Case |
| --- | --- | --- |
| **Unified API & Proxy** | **LiteLLM** | Standardizing multiple LLM providers and tracking costs. |
| **RAG (Knowledge Base)** | **LlamaIndex** | Connecting your store's documentation or PDF guides to an AI assistant. |
| **Complex Multi-Agent** | **LangGraph** | Advanced workflows where multiple agents "talk" to handle an order. |

---

### 🛠️ Implementation Guidance: LiteLLM + Saleor

To integrate this effectively with your **Saleor App**, follow this refined architecture:

1. **Centralized AI Gateway:** Host the LiteLLM Proxy in your **Docker Compose** environment alongside Saleor and MinIO.
2. **Saleor Webhooks:** When an event like `ORDER_CREATED` occurs, Saleor sends a webhook to your custom middleware.
3. **LiteLLM Request:** Your middleware sends the order data to your **LiteLLM Proxy** at `http://litellm:4000/chat/completions`.
4. **AI Analysis:** The LLM generates a personalized "Thank You" email or a manufacturing summary for your 3D printing queue.

#### 🛡️ GDPR Compliance (European Hosting)

As you are targeting the Czech market (**drdarky.cz**), configure LiteLLM to use **Azure OpenAI** or **AWS Bedrock** endpoints located in **Europe (e.g., Frankfurt or Ireland)** to keep customer data within the EU.

---

### 📉 Cost Management Recommendation

Since you'll be processing thousands of product descriptions or customer inquiries, use **LiteLLM's Budgeting** feature:

```yaml
# litellm_config.yaml example
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: azure/gpt-4o
      api_base: https://your-endpoint.openai.azure.com/
model_settings:
  - model_name: gpt-4o
    # Stop requests if this specific model hits a $50 monthly limit
    max_budget: 50 

```

---

### 🎯 Success Criteria Update

* [x] **Framework:** LiteLLM selected for unified API and cost tracking.
* [x] **Architecture:** Dockerized Proxy identified as the best deployment model.
* [x] **GDPR:** Identified European hosting as a requirement for the CZ market.

**Since you are looking at AI frameworks, would you like me to find the best Python libraries for "RAG" (Retrieval-Augmented Generation) so your AI can answer customer questions based on your specific product manuals?**
