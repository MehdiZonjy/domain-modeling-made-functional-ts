# Domain Modeling Made Functional TypeScript examples

An attempt to translate [Domain Modeling Made Functional](https://pragprog.com/book/swdddf/domain-modeling-made-functional) code examples to typescript


I'm using the following fp libraries to drive my solution
 - [fp-ts](https://github.com/gcanti/fp-ts):  FP ADTs and abstractions
 - [newtype-ts](https://github.com/gcanti/newtype-ts): isomorphic `newtype` types
 - [fp-ts-contrib](https://github.com/gcanti/fp-ts-contrib):  `do notation`
 - [Ramda](https://ramdajs.com/): handy helper functions (specially curried array `map`)


### POST /orders
Payload
```json
{
	"orderId": "order1",
	"customerInfo": {
		"firstName": "mehdi",
		"lastName": "zonjy",
		"emailAddress": "mehdi@zonjy.com",
		"vipStatus":"normal"
	},
	"shippingAddress": {
		"addressLine1": "address 1",
		"addressLine2": "",
		"addressLine3":"",
		"addressLine4": "",
		"city": "some city",
		"zipCode": "12365",
		"state": "DC",
		"country": "aah"
	},
	"billingAddress": {
		"addressLine1": "address 1",
		"addressLine2": "",
		"addressLine3":"",
		"addressLine4": "",
		"city": "some city",
		"zipCode": "44445",
		"state": "DC",
		"country": "aah"
	},
	"lines":[{
		"orderLineId": "orderLine1",
		"productCode": "W1232",
		"quantity": 123
	}],
	"promotionCode": "normal"
}
```
