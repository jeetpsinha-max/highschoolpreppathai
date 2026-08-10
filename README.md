# PrepPath AI

Build a full, production-ready web application named High School PrepPath.
This platform helps middle-school and high-school students explore, match with, and apply to private, boarding, magnet, and selective public high schools.
Use a clean, academic, modern design with a blue/teal/white palette, rounded cards, Poppins/Inter fonts, and highly organized layouts.

1. DATA INGESTION (REQUIRED FIRST STEP)

Import the full school dataset from the provided file:
“PrepPath AI Data - Sheet1 (2).pdf” 

PrepPath AI Data - Sheet1 (2)

Parse every row into a database table named schools with the fields:

name

type

city

state

website

admission_type

boarding

competitiveness

size

notes

Ensure all 350+ schools populate the system.

2. PLATFORM FEATURES (BUILD ALL)
A. School Finder Engine

Create a searchable, filterable interface using the dataset. Include filters for:

State

Competitiveness

Boarding vs Day

School type (private, charter, magnet, Jesuit, Quaker, STEM, LD-support, arts, girls-only, boys-only)

Size

Residential public

Selective public

Specialized schools

Display results as school cards with:

Name

City/State

Competitiveness

Boarding/day

Website button

Tags (girls’, Jesuit, STEM, LD, etc.)

B. School Profile Pages (Template Auto-Generated)

For each school entry, generate a full page containing:

Name, address, website

Competitiveness, admission type, size

Notes (girls’ school, LD support, etc.)

AI-generated sections:

“What this school excels at”

“Student experience overview”

“Is this school a good fit for you?”

Button: Run Improve Your Chances AI

3. AI TOOL SUITE (ALL TOOLS MUST BE BUILT)
A. AI School Matcher

A 12–15 question assessment for students:
Academic interests, competitiveness preference, location, boarding/day, extracurriculars, school size preference, diversity values, STEM/arts focus, learning style.

AI outputs:

Reach / Target / Safety lists

Why each school matches

Links to each school profile

Data-driven matching uses the PDF dataset.

B. AI School Generator

User describes their ideal school.
AI generates:

Ideal school profile

Comparison to real schools

10 closest matches from dataset

C. AI Interview Coach

Features:

Randomized interview questions

Optional microphone input

AI feedback: clarity, confidence, structure

Follow-up questions

Track all past attempts in student dashboard

D. Improve Your Chances AI

For any school:

What the school values

Typical accepted student profile

Recommended extracurricular enhancements

Suggested academic improvements

Strategy for essays/interviews

Legacy option toggle

Timeline for preparation

Link to SSAT/SAT prep where relevant

E. SSAT Practice Tool

AI question generator

Section-based practice

Explanations

Score tracking in dashboard

F. AI Application Assistant

Essay brainstormer

Draft improver

Activity list builder

Resume builder

Email templates to admissions

Parent summary mode

Ensure all suggestions follow age-appropriate safety.

4. AUTHENTICATION + DASHBOARD

Create login/signup for:

Students

Parents

Dashboard includes:

Saved schools

Matcher results

Interview sessions

Essays and drafts

SSAT practice progress

Application checklist with deadlines

5. SITE ARCHITECTURE (PAGES)

Build:

Home Page

Hero: “Find Your Best-Fit High School with AI”

CTA: Try School Matcher / Explore Schools

Feature grid

Testimonials

School ticker (use data from PDF)

School Finder

School Profile Template (auto-build all)

AI Tools Hub

Matcher

Generator

Interview Coach

Improve Your Chances

Application Assistant

SSAT Practice

About Page

Mission

Why PrepPath

Powered by dataset (cite PDF)

Contact Page

Beta for Schools Page

Invite middle schools (e.g., Millstone Middle School) to join free pilot

Benefits + signup form

6. BRANDING

Deep Blue #1D3557

Teal #2A9D8F

Soft Grey #F1F1F1

White #FFFFFF

Round corners, modern cards

Light hover animations

7. SAFETY REQUIREMENTS

All AI outputs must be:

Age-appropriate

Supportive

No harmful/unsafe content

No adult themes

8. FINAL REQUIREMENT

Generate all pages, all backend logic, database ingestion, AI endpoints, UI components, and school profiles so that the entire platform is fully functional immediately upon build.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://highschoolpreppathai.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/dd35a836-0370-4883-9809-134a6bed635c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
