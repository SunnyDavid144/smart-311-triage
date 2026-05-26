import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

// Schema for the structured AI output
const TriageSchema = z.object({
  citizenResponse: z
    .string()
    .describe(
      "A warm, empathetic, jargon-free confirmation message to the citizen. 2-3 sentences max. Sound human, not robotic."
    ),
  tickets: z
    .array(
      z.object({
        id: z
          .string()
          .describe("A ticket ID in format TKT-XXXX with random 4-digit number"),
        department: z
          .string()
          .describe(
            "The municipal department responsible (e.g. Sanitation, Public Works, Water Department, Parks & Recreation, Code Enforcement, Electrical Services, Animal Control, Police)"
          ),
        issue: z
          .string()
          .describe("A concise title for the issue, 3-6 words"),
        priority: z
          .enum(["Low", "Normal", "High", "Urgent"])
          .describe("Priority based on safety impact and urgency"),
        location: z
          .string()
          .describe(
            "The location extracted from the complaint, or 'Reported area' if not specified"
          ),
        status: z.string().describe("Always 'Routed' for new tickets"),
        eta: z
          .string()
          .describe(
            "Estimated response time based on priority and department norms"
          ),
      })
    )
    .describe(
      "Split the complaint into distinct actionable tickets. One ticket per distinct issue. Most complaints produce 1-3 tickets."
    ),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const complaint: string = body.complaint || "";

  // Check if OpenAI key is configured
  const hasApiKey =
    process.env.OPENAI_API_KEY &&
    process.env.OPENAI_API_KEY !== "your-api-key-here";

  console.log("[triage] API key present:", hasApiKey);

  if (!hasApiKey) {
    console.log("[triage] No API key — using mock fallback");
    return NextResponse.json(getMockResponse(complaint));
  }

  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: TriageSchema,
      prompt: `You are a municipal 311 triage system. A citizen has submitted the following complaint. 
      
Parse it into structured tickets and generate a friendly citizen response.

Rules:
- Split multi-issue complaints into separate tickets
- Assign the correct municipal department for each issue
- Set priority based on safety risk (Urgent = immediate danger, High = safety concern, Normal = quality of life, Low = cosmetic)
- Extract location info if mentioned
- The citizen response should be warm, natural, and confirm what actions are being taken
- Never use bureaucratic jargon in the citizen response

Citizen complaint: "${complaint}"`,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error("[triage] AI error:", error);
    // Fall back to mock if AI fails
    return NextResponse.json(getMockResponse(complaint));
  }
}

// ─── Mock fallback (used when no API key is set) ────────────────────────────

function getMockResponse(complaint: string) {
  const text = complaint.toLowerCase();

  if (
    (text.includes("trash") || text.includes("garbage")) &&
    (text.includes("pothole") || text.includes("road"))
  ) {
    return {
      citizenResponse:
        "Thanks for letting us know about the missed trash pickup and the pothole on your street. We've routed these to the right teams — Sanitation will follow up on the collection, and Public Works is on it for the road repair. We'll keep you updated as things move forward.",
      tickets: [
        {
          id: "TKT-4821",
          department: "Sanitation",
          issue: "Missed Trash Pickup",
          priority: "Normal",
          location: "Elm St (full block)",
          status: "Routed",
          eta: "24–48 hours",
        },
        {
          id: "TKT-4822",
          department: "Public Works",
          issue: "Pothole — Road Hazard",
          priority: "High",
          location: "Elm St & Cross Intersection",
          status: "Routed",
          eta: "3–5 business days",
        },
      ],
    };
  }

  if (text.includes("light") || text.includes("lamp") || text.includes("dark")) {
    return {
      citizenResponse:
        "We hear you — a broken streetlight makes the whole area feel unsafe, especially at night. We've flagged this for the electrical maintenance crew and they'll get it scheduled for repair.",
      tickets: [
        {
          id: "TKT-4830",
          department: "Electrical Services",
          issue: "Streetlight Outage",
          priority: "High",
          location: "Reported area",
          status: "Routed",
          eta: "2–4 business days",
        },
      ],
    };
  }

  if (
    text.includes("noise") ||
    text.includes("loud") ||
    text.includes("music") ||
    text.includes("party")
  ) {
    return {
      citizenResponse:
        "Sorry you're dealing with that. Noise issues are disruptive and we take them seriously. We've logged this and notified the appropriate enforcement team to look into it.",
      tickets: [
        {
          id: "TKT-4835",
          department: "Code Enforcement",
          issue: "Noise Violation",
          priority: "Normal",
          location: "Reported address",
          status: "Routed",
          eta: "Same day response",
        },
      ],
    };
  }

  if (
    text.includes("water") ||
    text.includes("flood") ||
    text.includes("hydrant") ||
    text.includes("leak")
  ) {
    return {
      citizenResponse:
        "Water issues can escalate quickly, so we've prioritized this. The Water Department has been notified and a crew will be dispatched to assess the situation.",
      tickets: [
        {
          id: "TKT-4840",
          department: "Water Department",
          issue: "Water Leak / Flooding",
          priority: "Urgent",
          location: "Reported area",
          status: "Dispatched",
          eta: "Within 4 hours",
        },
      ],
    };
  }

  if (text.includes("graffiti") || text.includes("vandal") || text.includes("spray")) {
    return {
      citizenResponse:
        "Thanks for reporting this. Graffiti and vandalism affect the whole neighborhood's sense of safety. We've notified the cleanup crew and filed a report with community services.",
      tickets: [
        {
          id: "TKT-4845",
          department: "Community Services",
          issue: "Graffiti / Vandalism",
          priority: "Normal",
          location: "Reported location",
          status: "Routed",
          eta: "3–5 business days",
        },
        {
          id: "TKT-4846",
          department: "Police (Non-Emergency)",
          issue: "Vandalism Report Filed",
          priority: "Low",
          location: "Reported location",
          status: "Logged",
          eta: "On file",
        },
      ],
    };
  }

  if (
    text.includes("tree") ||
    text.includes("branch") ||
    text.includes("park") ||
    text.includes("overgrown")
  ) {
    return {
      citizenResponse:
        "Got it — we've let Parks & Recreation know about this. They'll send someone out to assess and take care of it. Thanks for helping keep the neighborhood looking good.",
      tickets: [
        {
          id: "TKT-4850",
          department: "Parks & Recreation",
          issue: "Tree / Vegetation Maintenance",
          priority: "Normal",
          location: "Reported area",
          status: "Routed",
          eta: "5–7 business days",
        },
      ],
    };
  }

  if (text.includes("sidewalk") || text.includes("curb") || text.includes("trip")) {
    return {
      citizenResponse:
        "Damaged sidewalks are a real tripping hazard — thanks for flagging this. Public Works will inspect the area and schedule a repair.",
      tickets: [
        {
          id: "TKT-4855",
          department: "Public Works",
          issue: "Sidewalk Damage",
          priority: "Normal",
          location: "Reported area",
          status: "Routed",
          eta: "5–10 business days",
        },
      ],
    };
  }

  if (
    text.includes("animal") ||
    text.includes("dog") ||
    text.includes("stray") ||
    text.includes("rat")
  ) {
    return {
      citizenResponse:
        "We understand this can be concerning. Animal Control has been notified and will investigate. If there's an immediate safety risk, please also call 911.",
      tickets: [
        {
          id: "TKT-4860",
          department: "Animal Control",
          issue: "Stray / Nuisance Animal",
          priority: "Normal",
          location: "Reported area",
          status: "Routed",
          eta: "24–48 hours",
        },
      ],
    };
  }

  // Default catch-all
  return {
    citizenResponse:
      "Thanks for reaching out. We've reviewed your report and routed it to the appropriate department. Someone will follow up with you soon — we appreciate you helping make the neighborhood better.",
    tickets: [
      {
        id: "TKT-4899",
        department: "General Services",
        issue: "Citizen Report — Under Review",
        priority: "Normal",
        location: "Reported area",
        status: "Under Review",
        eta: "2–3 business days",
      },
    ],
  };
}
