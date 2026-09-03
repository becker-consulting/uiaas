import { MAX_FACT_LENGTH } from './facts';

/**
 * Hand-written, not generated — there's exactly one real endpoint, so a
 * schema-validation framework (e.g. @hono/zod-openapi) to derive this from
 * route definitions would be solving a problem this app doesn't have yet.
 * Revisit if the API ever grows past a couple of endpoints.
 *
 * Served as JSON at GET /api/v1/openapi.json (routes/api.ts) and rendered
 * via Swagger UI at /docs (src/index.tsx) — the nav's "API" link.
 */
export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'UIaaS API',
    version: '1.0.0',
    description:
      'Enterprise-grade nonsense, delivered via a fully documented, versioned REST API. ' +
      'Every pricing tier hits this exact same endpoint — see the pricing page for the cosmetic differences.',
  },
  servers: [{ url: '/api/v1', description: 'Production (and local dev — there is only one environment)' }],
  paths: {
    '/fact': {
      get: {
        summary: 'Retrieve one useless fact',
        description:
          'Returns a single random *approved* fact, scored on our proprietary Negative Usefulness Index™. ' +
          'Free, Pro, and Enterprise all hit this exact same operation. Submissions via POST /fact are not ' +
          'eligible until they clear editorial review.',
        operationId: 'getFact',
        responses: {
          '200': {
            description: 'A useless fact, successfully delivered.',
            headers: {
              'X-RateLimit-Limit': {
                description: 'Advertised free-tier daily limit. Not enforced.',
                schema: { type: 'integer', example: 3 },
              },
              'X-RateLimit-Remaining': {
                description: 'Always equal to the limit. We are not counting.',
                schema: { type: 'integer', example: 3 },
              },
            },
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Fact' },
                example: {
                  fact: 'Honey never spoils — edible honey has been found in 3,000-year-old Egyptian tombs.',
                  usefulness: 0,
                  uselessness_label: 'Perfectly useless, as advertised.',
                  id: 'uiaas_00003',
                  tier_required: 'any',
                },
              },
            },
          },
          '503': {
            description: 'No approved facts available. Enterprise support has been notified (it has not).',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Error' } },
            },
          },
        },
      },
      post: {
        summary: 'Submit a new useless fact',
        description:
          'Open to anyone — no authentication required, rate-limited instead (5 requests per 60s per IP). ' +
          'A submission is never immediately live: it enters editorial review and GET /fact will not return ' +
          'it until approved. Publication is not guaranteed.',
        operationId: 'submitFact',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/FactSubmission' },
              example: { fact: 'The Golden Gate Bridge is not gold — it is painted "International Orange."' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Submission received and queued for review.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SubmissionReceipt' },
                example: {
                  id: 'uiaas_00016',
                  status: 'pending_review',
                  message:
                    "Submission received and entered into editorial review. Published submissions are selected at UIaaS's sole discretion.",
                },
              },
            },
          },
          '400': {
            description: 'Missing, empty, or oversized "fact" field, or a non-JSON request body.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Error' } },
            },
          },
          '429': {
            description: 'Rate limit exceeded — more than 5 submissions from this IP in the last 60 seconds.',
            headers: {
              'Retry-After': {
                description: 'Seconds until the rate limit window resets. An approximation, not an exact countdown.',
                schema: { type: 'integer', example: 60 },
              },
            },
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Error' } },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Fact: {
        type: 'object',
        required: ['fact', 'usefulness', 'uselessness_label', 'id', 'tier_required'],
        properties: {
          fact: { type: 'string', description: 'The useless fact itself.' },
          usefulness: {
            type: 'integer',
            maximum: 0,
            description: 'Negative Usefulness Index™. Zero or lower — zero is the best score a fact can get.',
          },
          uselessness_label: {
            type: 'string',
            description: 'Human-readable rating for the usefulness score, e.g. "Legally you cannot un-know this."',
          },
          id: {
            type: 'string',
            pattern: '^uiaas_\\d{5}$',
            description: 'Public fact id.',
            example: 'uiaas_00003',
          },
          tier_required: {
            type: 'string',
            enum: ['any'],
            description: 'Which pricing tier is required to call this endpoint. Always "any" — see CLAUDE.md.',
          },
        },
      },
      FactSubmission: {
        type: 'object',
        required: ['fact'],
        properties: {
          fact: {
            type: 'string',
            maxLength: MAX_FACT_LENGTH,
            description: 'The fact being submitted. Scored and reviewed after submission, not by the submitter.',
          },
        },
      },
      SubmissionReceipt: {
        type: 'object',
        required: ['id', 'status', 'message'],
        properties: {
          id: { type: 'string', pattern: '^uiaas_\\d{5}$', description: 'Public id assigned to the submission.' },
          status: { type: 'string', enum: ['pending_review'], description: 'Always "pending_review" on success.' },
          message: { type: 'string' },
        },
      },
      Error: {
        type: 'object',
        required: ['error'],
        properties: { error: { type: 'string' } },
      },
    },
  },
} as const;
