export const array_move = (original_array, old_index, new_index) => {
	let arr = original_array.slice();
	while (old_index < 0) {
		old_index += arr.length;
	}
	while (old_index >= arr.length) {
		old_index -= arr.length;
	}
	while (new_index < 0) {
		new_index += arr.length;
	}
	while (new_index >= arr.length) {
		new_index -= arr.length;
	}
	if (new_index >= arr.length) {
		var k = new_index - arr.length + 1;
		while (k--) {
			arr.push(undefined);
		}
	}
	arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
	return arr;
};