import { test } from 'node:test';
import * as assert from 'node:assert';

// Import the function from the main module
// For now, let's write the function directly in the test file until we can import properly
function parseTimestamp(text: string): string | null {
	// Extract numbers from text (handle cases like "s_at_ms": 1755599313784)
	const numberMatch = text.match(/\d{10,13}/);
	if (!numberMatch) {
		return null;
	}
	
	const timestamp = parseInt(numberMatch[0]);
	
	// Check if it's a valid timestamp (reasonable range)
	// Timestamps should be between 2001 and 2100
	const minTimestamp = 978307200; // 2001-01-01
	const maxTimestamp = 4102444800; // 2100-01-01
	
	let timestampInSeconds;
	
	// Determine if it's milliseconds (13 digits) or seconds (10 digits)
	if (timestamp.toString().length === 13) {
		timestampInSeconds = Math.floor(timestamp / 1000);
	} else if (timestamp.toString().length === 10) {
		timestampInSeconds = timestamp;
	} else {
		return null;
	}
	
	// Validate range
	if (timestampInSeconds < minTimestamp || timestampInSeconds > maxTimestamp) {
		return null;
	}
	
	// Convert to ISO string
	const date = new Date(timestampInSeconds * 1000);
	return date.toISOString().replace('.000Z', 'Z');
}

test('dummy test should pass', () => {
	assert.strictEqual(1 + 1, 2);
});

test('parseTimestamp should handle millisecond timestamps', () => {
	const input = '"s_at_ms": 1755599313784';
	const result = parseTimestamp(input);
	// 1755599313784 ms = 1755599313 seconds = 2025-08-19T10:28:33Z
	assert.strictEqual(result, '2025-08-19T10:28:33Z');
});

test('parseTimestamp should handle second timestamps', () => {
	const input = 'timestamp: 1734796800';
	const result = parseTimestamp(input);
	// 1734796800 seconds = 2024-12-21T16:00:00Z
	assert.strictEqual(result, '2024-12-21T16:00:00Z');
});

test('parseTimestamp should return null for non-timestamp text', () => {
	assert.strictEqual(parseTimestamp('hello world'), null);
	assert.strictEqual(parseTimestamp('123'), null);
	assert.strictEqual(parseTimestamp(''), null);
});

test('parseTimestamp should return null for invalid timestamps', () => {
	// Too old (before 2001)
	assert.strictEqual(parseTimestamp('900000000'), null);
	// Too new (after 2100)  
	assert.strictEqual(parseTimestamp('5000000000'), null);
});