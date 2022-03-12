- selecting armor stands
	- nearest
	- use mouse
- custom_armor_stands trigger functionality
	- error out when armor stand is unloaded
- compiling the book pages based on book data & properties of selected armor stand
- compiling the book lore based on clipboard/macro
- apply operations from storage onto armor stand

```json
// This is an example of the pack's NBT storage, for developmental use.
{
	"book": {
		"pastActions": [
			{
				"id": "copy_rotation"
			},
			{
				"id": "set_rotation",
				"value": 22.5
			},
			{
				"id": "multiple",
				"value": [
					{
						"id": "set_rotation",
						"value": 22.5
					}
				],
				"undoActions": {
					"id": "multiple",
					"value": []
				}
			}
		],
		"futureActions": []
	},
	"temp": {
		"id": "copy_rotation"
	}
}
```