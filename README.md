# Serverless E-Commerce API (Azure)

This project demonstrates a serverless e-commerce order processing system built using Microsoft Azure.

## Architecture

The solution uses the following Azure services:

- Azure Functions for order processing
- Azure Cosmos DB for storing order data
- Azure Service Bus for asynchronous messaging
- Azure Logic Apps for sending order notifications
- API Management as the API gateway

## Workflow

1. Client sends order request via API
2. Azure Function processes order
3. Order stored in Cosmos DB
4. Message sent to Service Bus queue
5. Logic App listens to queue
6. Email notification sent to customer

## Demo Features

- Order creation via API
- Real-time notification via Logic App
- Serverless scalable architecture

## Author

Denzel Gallardo
Seneca Polytechnic – CSP451
