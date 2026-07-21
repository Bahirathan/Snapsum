/**
 * Zipytiny SEO & GEO Discovery Automated Test Suite
 * Created by: Principal QA Engineer
 * 
 * This script performs rigorous automated end-to-end checks on all public discovery
 * endpoints to validate metadata injection, XML schema compliance, JSON-LD structure,
 * and semantic keyword alignment.
 */

import { existsSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'http://localhost:3000';

interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
  details?: any;
}

const results: TestResult[] = [];

function assert(condition: boolean, name: string, message: string, details?: any) {
  results.push({
    name,
    passed: condition,
    message: condition ? 'Success' : message,
    details
  });
}

async function runTests() {
  console.log('\n==================================================');
  console.log('🚀 RUNNING ZIPYTINY SEO & GEO DISCOVERY TESTS');
  console.log('==================================================\n');

  // --- TEST 1: robots.txt ---
  try {
    console.log('📋 Testing /robots.txt...');
    const res = await fetch(`${BASE_URL}/robots.txt`);
    assert(res.status === 200, 'robots.txt status', `Expected 200, got ${res.status}`);
    const text = await res.text();
    assert(text.includes('Sitemap: https://www.zipytiny.app/sitemap.xml'), 'robots.txt Sitemap', 'Sitemap directive missing');
    assert(text.includes('Link: https://www.zipytiny.app/llms.txt; rel="llms"'), 'robots.txt LLM discovery', 'llms.txt discoverability tag missing');
  } catch (err: any) {
    assert(false, 'robots.txt fetch', `Failed to fetch: ${err.message}`);
  }

  // --- TEST 2: llms.txt ---
  try {
    console.log('📋 Testing /llms.txt...');
    const res = await fetch(`${BASE_URL}/llms.txt`);
    assert(res.status === 200, 'llms.txt status', `Expected 200, got ${res.status}`);
    const text = await res.text();
    assert(text.length > 50, 'llms.txt size', 'llms.txt content is too short or empty');
    assert(text.includes('Zipytiny'), 'llms.txt branding', 'Zipytiny branding missing from llms.txt');
  } catch (err: any) {
    assert(false, 'llms.txt fetch', `Failed to fetch: ${err.message}`);
  }

  // --- TEST 3: sitemap.xml ---
  try {
    console.log('📋 Testing /sitemap.xml...');
    const res = await fetch(`${BASE_URL}/sitemap.xml`);
    assert(res.status === 200, 'sitemap.xml status', `Expected 200, got ${res.status}`);
    assert(res.headers.get('content-type')?.includes('xml') || false, 'sitemap.xml content-type', `Expected XML, got ${res.headers.get('content-type')}`);
    
    const xml = await res.text();
    assert(xml.startsWith('<?xml'), 'sitemap.xml formatting', 'Does not start with XML declaration');
    assert(xml.includes('<urlset'), 'sitemap.xml outer tag', 'Missing <urlset> tag');
    
    // Check specific tools links are present
    assert(xml.includes('<loc>https://www.zipytiny.app/tools/youtube-lecture-summarizer</loc>'), 'Sitemap YouTube tools route', 'YouTube lecture summarizer tools route missing in sitemap');
    assert(xml.includes('<loc>https://www.zipytiny.app/tools/pdf-study-guide-generator</loc>'), 'Sitemap PDF tools route', 'PDF study guide generator tools route missing in sitemap');
    assert(xml.includes('<loc>https://www.zipytiny.app/tools/interactive-ai-tutor</loc>'), 'Sitemap Tutor tools route', 'Interactive AI tutor tools route missing in sitemap');
  } catch (err: any) {
    assert(false, 'sitemap.xml fetch', `Failed to fetch: ${err.message}`);
  }

  // --- TEST 4: SEO Landing Pages /tools/* ---
  const slugs = [
    {
      slug: 'youtube-lecture-summarizer',
      expectedTitle: 'AI YouTube Lecture Summarizer & Workspace | Zipytiny',
      expectedKeyword: 'convert youtube lecture to quiz',
      appName: 'Zipytiny AI YouTube Lecture Summarizer'
    },
    {
      slug: 'pdf-study-guide-generator',
      expectedTitle: 'AI PDF Study Guide Generator & Workspace | Zipytiny',
      expectedKeyword: 'ai study guide generator from pdf',
      appName: 'Zipytiny AI PDF Study Guide Generator'
    },
    {
      slug: 'interactive-ai-tutor',
      expectedTitle: 'Interactive AI Tutor & Feynman Assistant | Zipytiny',
      expectedKeyword: 'interactive feynman study assistant',
      appName: 'Zipytiny Interactive AI Tutor'
    }
  ];

  for (const info of slugs) {
    try {
      console.log(`📋 Testing /tools/${info.slug}...`);
      const res = await fetch(`${BASE_URL}/tools/${info.slug}`);
      assert(res.status === 200, `${info.slug} status`, `Expected 200, got ${res.status}`);
      
      const html = await res.text();
      
      // 1. Check title
      assert(html.includes(`<title>${info.expectedTitle}</title>`), `${info.slug} title`, `Title tag missing or mismatched. Expected: ${info.expectedTitle}`);
      
      // 2. Check canonical link
      const canonicalRegex = new RegExp(`<link[^>]*rel="canonical"[^>]*href="https://www.zipytiny.app/tools/${info.slug}"[^>]*>`, 'i');
      assert(canonicalRegex.test(html), `${info.slug} canonical link`, `Canonical link tag missing or incorrect for ${info.slug}`);
      
      // 3. Check OpenGraph and Twitter cards
      assert(html.includes(`<meta property="og:title" content="${info.expectedTitle}" />`), `${info.slug} og:title`, 'og:title missing or incorrect');
      assert(html.includes(`<meta property="og:url" content="https://www.zipytiny.app/tools/${info.slug}" />`), `${info.slug} og:url`, 'og:url missing or incorrect');
      assert(html.includes('<meta name="twitter:card" content="summary_large_image" />'), `${info.slug} twitter:card`, 'twitter:card missing or incorrect');
      
      // 4. Validate JSON-LD Scripts (crucial for SEO & GEO schema validation)
      const jsonLdRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
      let match;
      let jsonLdCount = 0;
      let hasWebAppSchema = false;
      let hasFAQPageSchema = false;
      
      while ((match = jsonLdRegex.exec(html)) !== null) {
        jsonLdCount++;
        const rawJson = match[1].trim();
        try {
          const parsed = JSON.parse(rawJson);
          assert(parsed['@context'] === 'https://schema.org', `${info.slug} json-ld schema context`, 'Schema context is not schema.org');
          
          if (parsed['@type'] === 'WebApplication') {
            hasWebAppSchema = true;
            assert(parsed.name === info.appName, `${info.slug} WebApplication name`, `Expected WebApplication name: ${info.appName}`);
          } else if (parsed['@type'] === 'FAQPage') {
            hasFAQPageSchema = true;
            assert(Array.isArray(parsed.mainEntity), `${info.slug} FAQ mainEntity`, 'FAQPage mainEntity is not an array');
          }
        } catch (jsonErr: any) {
          assert(false, `${info.slug} JSON-LD JSON validity`, `Malformed JSON-LD payload: ${jsonErr.message}`);
        }
      }
      
      assert(jsonLdCount >= 2, `${info.slug} JSON-LD count`, `Expected at least 2 structured JSON-LD payloads, found ${jsonLdCount}`);
      assert(hasWebAppSchema, `${info.slug} has WebApplication schema`, 'Missing WebApplication JSON-LD schema');
      assert(hasFAQPageSchema, `${info.slug} has FAQPage schema`, 'Missing FAQPage JSON-LD schema');

      // 5. Check semantic SEO text (hidden <article> tag)
      const articleRegex = /<article[^>]*>([\s\S]*?)<\/article>/i;
      const articleMatch = articleRegex.exec(html);
      assert(articleMatch !== null, `${info.slug} has semantic article`, 'Missing hidden <article> markup for GEO crawler entity-linking');
      
      if (articleMatch) {
        const articleContent = articleMatch[1].toLowerCase();
        assert(articleContent.includes(info.expectedKeyword), `${info.slug} target keyword check`, `Article does not contain target keyword "${info.expectedKeyword}"`);
        assert(articleContent.includes('active recall') || articleContent.includes('spaced repetition'), `${info.slug} topic cluster check`, 'Article does not contain cognitive science topic clusters');
      }

    } catch (err: any) {
      assert(false, `${info.slug} process check`, `Failed to perform checks: ${err.message}`);
    }
  }

  // --- TEST 5: Negative Testing (invalid route) ---
  try {
    console.log('📋 Testing /tools/non-existent-slug (negative case)...');
    const res = await fetch(`${BASE_URL}/tools/non-existent-slug`);
    assert(res.status === 404, 'negative case 404 route', `Expected 404 for invalid tool slug, got ${res.status}`);
  } catch (err: any) {
    assert(false, 'negative case process check', `Failed to fetch: ${err.message}`);
  }

  // --- REPORT GENERATION ---
  console.log('\n==================================================');
  console.log('📊 ZIPYTINY TEST RUN REPORT');
  console.log('==================================================');
  
  const passedTests = results.filter(r => r.passed);
  const failedTests = results.filter(r => !r.passed);
  
  console.log(`Total Checks Executed: ${results.length}`);
  console.log(`Passed Checks:        🟢 ${passedTests.length}`);
  console.log(`Failed Checks:        🔴 ${failedTests.length}`);
  
  if (failedTests.length > 0) {
    console.log('\n❌ FAILED CHECKS LIST:');
    for (const f of failedTests) {
      console.log(`- [${f.name}]: ${f.message}`);
    }
    process.exit(1);
  } else {
    console.log('\n🟩 ALL CHECKS PASSED SUCCESSFULLY!');
    process.exit(0);
  }
}

runTests();
