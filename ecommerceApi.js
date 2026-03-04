const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');
const { ServiceBusClient } = require('@azure/service-bus');

const cosmosClient = new CosmosClient({
    endpoint: process.env.COSMOS_ENDPOINT,
    key: process.env.COSMOS_KEY
});

const database = cosmosClient.database(process.env.COSMOS_DATABASE);
const productsContainer = database.container(process.env.COSMOS_PRODUCTS_CONTAINER);
const ordersContainer = database.container(process.env.COSMOS_ORDERS_CONTAINER);

const serviceBusClient = new ServiceBusClient(process.env.SERVICEBUS_CONNECTION);
const sender = serviceBusClient.createSender(process.env.SERVICEBUS_QUEUE);

app.http('ecommerceApi', {
    methods: ['GET', 'POST'],
    authLevel: 'function',
    handler: async (request, context) => {

        try {

            // GET /products
            if (request.method === 'GET') {

                const { resources } = await productsContainer.items.readAll().fetchAll();

                return {
                    status: 200,
                    jsonBody: resources
                };
            }

            // POST /order
            if (request.method === 'POST') {

                const body = await request.json();

                const productId = String(body.productId);
                const quantity = Number(body.quantity);

                if (!productId || !quantity) {
                    return {
                        status: 400,
                        jsonBody: { error: "productId and quantity are required" }
                    };
                }

                // Check product exists
                const { resource: product } = await productsContainer.item(productId, productId).read();

                if (!product) {
                    return {
                        status: 404,
                        jsonBody: { error: "Product not found" }
                    };
                }

                const totalPrice = product.price * quantity;

                const order = {
                    id: `order-${Date.now()}`,
                    productId,
                    quantity,
                    totalPrice,
                    orderDate: new Date().toISOString()
                };

                // Save order to Cosmos DB
                await ordersContainer.items.create(order);

                // Send message to Service Bus
                await sender.sendMessages({
                    body: order
                });

                return {
                    status: 201,
                    jsonBody: order
                };
            }

            return {
                status: 405,
                jsonBody: { error: "Method not allowed" }
            };

        } catch (error) {
            context.log("Error:", error);

            return {
                status: 500,
                jsonBody: { error: error.message }
            };
        }
    }
});