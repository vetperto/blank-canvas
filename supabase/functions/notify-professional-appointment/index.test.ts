import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

const functionUrl = `${SUPABASE_URL}/functions/v1/notify-professional-appointment`;

Deno.test("notify-professional-appointment - should fail without appointmentId", async () => {
  const response = await fetch(functionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({}),
  });

  const data = await response.json();
  
  assertEquals(response.status, 500);
  assertExists(data.error);
  assertEquals(data.error, "appointmentId is required");
});

Deno.test("notify-professional-appointment - should fail with invalid appointmentId", async () => {
  const response = await fetch(functionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      appointmentId: "00000000-0000-0000-0000-000000000000"
    }),
  });

  const data = await response.json();
  
  assertEquals(response.status, 500);
  assertExists(data.error);
  // Should fail because appointment doesn't exist
});

Deno.test("notify-professional-appointment - should handle CORS preflight", async () => {
  const response = await fetch(functionUrl, {
    method: "OPTIONS",
    headers: {
      "Origin": "http://localhost:3000",
      "Access-Control-Request-Method": "POST",
    },
  });

  await response.text(); // Consume body
  
  assertEquals(response.status, 200);
  assertEquals(response.headers.get("Access-Control-Allow-Origin"), "*");
});

// Integration test - only run with real data
Deno.test({
  name: "notify-professional-appointment - integration test structure",
  ignore: true, // Set to false when you have real test data
  fn: async () => {
    // This test requires a real appointment ID in the database
    // Replace with actual appointment ID for integration testing
    const testAppointmentId = "YOUR_TEST_APPOINTMENT_ID";
    
    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        appointmentId: testAppointmentId
      }),
    });

    const data = await response.json();
    
    // Verify response structure
    assertExists(data.success);
    assertExists(data.appointmentId);
    assertEquals(data.appointmentId, testAppointmentId);
    
    // If successful, verify notification was created
    if (data.success) {
      assertEquals(data.notificationCreated, true);
    }
    
    console.log("Integration test result:", data);
  }
});
