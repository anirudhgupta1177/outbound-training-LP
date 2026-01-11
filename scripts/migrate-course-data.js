// Script to migrate existing course data from static file to Supabase
// Run with: SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/migrate-course-data.js

import { createClient } from '@supabase/supabase-js';

// Course data (copied from src/constants/courseData.js)
function getLoomEmbedUrl(shareUrl) {
  const match = shareUrl.match(/share\/([a-f0-9]+)/);
  if (match && match[1]) {
    return `https://www.loom.com/embed/${match[1]}`;
  }
  return shareUrl;
}

const courseData = {
  title: 'Outbound Mastery',
  description: 'Comprehensive outbound marketing and lead generation training',
  modules: [
    {
      id: 'module-1',
      title: 'Setting up GTM Fundamentals',
      order: 1,
      lessons: [
        {
          id: 'lesson-1-1',
          title: 'ICP Creation',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/d7accd84aab84e9aba2867aa11184d6a?sid=61675a26-36e0-41c7-bc54-1a77f33d8a97'),
          order: 1,
          status: 'available',
        },
        {
          id: 'lesson-1-2',
          title: 'Offer Creation',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/d73fbf40c9054cb090f577e0981b8d80?sid=ea6e77c0-6d84-4f45-8b15-8c1430f1f076'),
          order: 2,
          status: 'available',
          whimsicalLinks: ['https://whimsical.com/offer-creation-SLYFLYXPCjkX3ukRT33DHz'],
        },
      ],
    },
    {
      id: 'module-2',
      title: 'Cold Email Training',
      order: 2,
      lessons: [
        {
          id: 'lesson-2-1',
          title: 'Email Techstack',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/87daa8f196f84e108554beffab08d982?sid=ba0cacdd-fdc5-42bf-82bf-eec93345d186'),
          order: 1,
          status: 'available',
        },
        {
          id: 'lesson-2-2',
          title: 'Email Campaign Strategy',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/bc57d6d2c22842768168fde29fd4c8e9?sid=9e4a5322-33bc-4043-9b60-60c8f93394c2'),
          order: 2,
          status: 'available',
        },
        {
          id: 'lesson-2-3',
          title: 'Email Deliverability Guide',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/50f05b74391548beab2cc0847419e1be?sid=90cdbfe7-8c04-47d3-a42c-30a3a20df699'),
          order: 3,
          status: 'available',
          whimsicalLinks: ['https://whimsical.com/cold-email-deliverability-guide-PvzTTmb9GUGb61GuwBP8Kr'],
        },
        {
          id: 'lesson-2-4',
          title: 'Email Outreach Guide',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/8e5463fca9bc4c7ba65a63619cb76eae?sid=e140ad8b-fa4c-48a2-94d0-75c85ab4b7d9'),
          order: 4,
          status: 'available',
        },
        {
          id: 'lesson-2-5',
          title: 'Email Guard Training',
          loomUrl: '',
          order: 5,
          status: 'coming-soon',
        },
      ],
    },
    {
      id: 'module-3',
      title: 'LinkedIn Lead Generation Training',
      order: 3,
      lessons: [
        {
          id: 'lesson-3-1',
          title: 'LinkedIn Account Safety Guide',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/9a910290c94045bebecfa94cdf4f4a36?sid=371de16f-4a16-42c9-a821-1a8eee85ce58'),
          order: 1,
          status: 'available',
        },
        {
          id: 'lesson-3-2',
          title: 'LinkedIn Outreach Tool Guide',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/745ebadef7544bcd8f74a6681edd38f3?sid=ab205708-b025-4e7f-bd79-e5e6f0ec5ae9'),
          order: 2,
          status: 'available',
        },
        {
          id: 'lesson-3-3',
          title: 'LinkedIn Sales Navigator Training',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/81609e86a32c4a58be2fe04c3ab770f4?sid=69789eee-c0f0-475f-b21f-820dd8ae7e6f'),
          order: 3,
          status: 'available',
          whimsicalLinks: ['https://whimsical.com/sales-nav-training-a-z-GaxJzmbKDibwsvhQNmvabX'],
        },
      ],
    },
    {
      id: 'module-4',
      title: 'Ultimate Leads Scraping Training',
      order: 4,
      lessons: [
        {
          id: 'lesson-4-1',
          title: 'Intro to Scraping Leads',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/696ec41c48524419bc53cf0c7855c00a?sid=44122976-286a-4da9-9faa-dea9eafad53d'),
          order: 1,
          status: 'available',
          whimsicalLinks: ['https://whimsical.com/my-entire-leads-scraping-guide-C8JDVguVag4D6wyLDZTeNx'],
        },
        {
          id: 'lesson-4-2',
          title: 'How to scrape High Intent Leads - Guide',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/fafca1e97013479a8a9c033b540389d0?sid=b65ae047-62e8-482e-8f41-aaf59e55bc19'),
          order: 2,
          status: 'available',
          whimsicalLinks: ['https://whimsical.com/my-entire-leads-scraping-guide-C8JDVguVag4D6wyLDZTeNx'],
        },
      ],
    },
    {
      id: 'module-5',
      title: 'Clay Training: Basic Tutorial',
      order: 5,
      lessons: [
        {
          id: 'lesson-5-1',
          title: 'Overview of this Lead List Building Module',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/01bb3aa929b846648496a10e779c38dd?sid=808b6348-bfb5-4a89-a570-20eaddcc9f5a'),
          order: 1,
          status: 'available',
          whimsicalLinks: ['https://whimsical.com/advanced-clay-training-GBD4BCsHwRcWDehreRifhG'],
        },
        {
          id: 'lesson-5-2',
          title: 'Phase 1 - Clay Training',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/161587a196f5469fb04eae31130e2f97?sid=4badb99e-80ef-4853-8829-4bdbcbd82f8b'),
          order: 2,
          status: 'available',
          whimsicalLinks: ['https://whimsical.com/advanced-clay-training-GBD4BCsHwRcWDehreRifhG'],
        },
        {
          id: 'lesson-5-3',
          title: 'Assignment 1',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/f79ab95fc9cd4aef93c1addb8ef16d04?sid=455808ad-385a-4f6c-908d-d4072c36fcf8'),
          order: 3,
          status: 'available',
        },
      ],
    },
    {
      id: 'module-6',
      title: 'Advanced Clay Training',
      order: 6,
      lessons: [
        {
          id: 'lesson-6-1',
          title: 'Clay Training Resource',
          loomUrl: '',
          order: 1,
          status: 'available',
          whimsicalLinks: ['https://whimsical.com/advanced-clay-training-GBD4BCsHwRcWDehreRifhG'],
        },
        {
          id: 'lesson-6-2',
          title: 'Phase 2 - Clay Training',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/90e1f884f5c249d18bcbc4965d98d710?sid=3b8ab6d6-f9d0-4a72-af0f-e97a0f50cc20'),
          order: 2,
          status: 'available',
          whimsicalLinks: ['https://whimsical.com/advanced-clay-training-GBD4BCsHwRcWDehreRifhG'],
        },
        {
          id: 'lesson-6-3',
          title: 'Assignment 2 Solution',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/7ed7ed570755436f8f30e06fa398976b?sid=ba8b0595-db45-4596-8500-6adac2dee2b4'),
          order: 3,
          status: 'available',
        },
        {
          id: 'lesson-6-4',
          title: 'Phase 2(Continue) - Clay Training',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/31ceb1edfc834ac79636dadda66523e1?sid=6547f835-148c-4c0e-8b24-058ed2c90c3b'),
          order: 4,
          status: 'available',
          whimsicalLinks: ['https://whimsical.com/advanced-clay-training-GBD4BCsHwRcWDehreRifhG'],
        },
        {
          id: 'lesson-6-5',
          title: 'Phase 3 - Clay Training',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/9f03437931d7432c99ef2f6697d4fe3e?sid=0ad964e6-07e5-493e-9342-131767ec7d5a'),
          order: 5,
          status: 'available',
          whimsicalLinks: ['https://whimsical.com/advanced-clay-training-GBD4BCsHwRcWDehreRifhG'],
        },
      ],
    },
    {
      id: 'module-7',
      title: 'Make Training Fundamentals',
      order: 7,
      lessons: [
        {
          id: 'lesson-7-1',
          title: 'Intro 1 - Make.com Training',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/d5ff0a9bdfc04de2af9f9a96f6605e23?sid=100bedff-ea6b-48ae-9032-b28a64467a91'),
          order: 1,
          status: 'available',
        },
        {
          id: 'lesson-7-2',
          title: 'Intro 2 - Make.com Training',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/4f4f76462cd04cfb9d99bbbdab2e5a72?sid=2fd94918-2016-4ccb-b185-d727167908b8'),
          order: 2,
          status: 'available',
        },
        {
          id: 'lesson-7-3',
          title: 'Pricing Tutorial Make.com Training',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/b637a9fcde1c43a0a87b32a672919e3e?sid=5925a291-d1aa-4b15-a6a7-98d8a0089dde'),
          order: 3,
          status: 'available',
        },
        {
          id: 'lesson-7-4',
          title: 'Dashboard & Modules_Operations_Scenarios - Make Training',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/52b1f08a0c6e49cdbb0ce5819e093d3a?sid=1939dfeb-aea1-400a-b62c-8b2bccfe2bc6'),
          order: 4,
          status: 'available',
        },
        {
          id: 'lesson-7-5',
          title: 'Triggers_Webhooks_Http-API - Make.com training',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/92904881cbb6404db326330aa69d3967?sid=0b2ebd3a-64c3-4532-b11c-81ffa41700e8'),
          order: 5,
          status: 'available',
        },
        {
          id: 'lesson-7-6',
          title: 'Native Tools - Make training',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/cbf266d6288b4d8980fe0767c2412373?sid=40b0c284-6c1a-4dcf-8d38-10f64a9c4682'),
          order: 6,
          status: 'available',
        },
        {
          id: 'lesson-7-7',
          title: 'Flow Control & Filters - Make.com Training',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/27795137ce1f4a6abfe90be473149bd9?sid=6093d138-170e-47e1-9b4a-ddc8cdf4d4da'),
          order: 7,
          status: 'available',
        },
        {
          id: 'lesson-7-8',
          title: 'Scheduling (Make.com)',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/8e6a71a474ee4a13a7b51b021d2a33a0?sid=f5965f74-a926-4af2-9ce3-796810ed7644'),
          order: 8,
          status: 'available',
        },
      ],
    },
    {
      id: 'module-8',
      title: 'Build AI Agents',
      order: 8,
      lessons: [
        {
          id: 'lesson-8-1',
          title: 'Automation 1 - Lead Reply Slack Notifier',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/e00043bb9ad94eb597cdb8c4a5026f9c?sid=85bfb834-f09c-4e28-ac9d-2c22c8a1ff15'),
          order: 1,
          status: 'available',
        },
        {
          id: 'lesson-8-2',
          title: 'Automation 2 - LinkedIn Competitor Engagement Outreach Agent',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/3448bebf7dc14a8fa5f0e6bc28853d73?sid=74bf9df3-cc5d-4bda-b0bf-889a3fd67c5d'),
          order: 2,
          status: 'available',
        },
        {
          id: 'lesson-8-3',
          title: 'Automation 3 - LinkedIn Content Creation and Scheduling Agent',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/14ae247787224b3ea7b6b2a89ca54463?sid=3f3dcca8-4ab9-4a5c-8c22-57b071bcacb1'),
          order: 3,
          status: 'available',
        },
      ],
    },
    {
      id: 'module-9',
      title: 'Outbound Copywriting Training',
      order: 9,
      lessons: [
        {
          id: 'lesson-9-1',
          title: 'LinkedIn Copywriting',
          loomUrl: '',
          order: 1,
          status: 'coming-soon',
        },
        {
          id: 'lesson-9-2',
          title: 'Email Copywriting',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/1e53544824054864a323a32dc7bfde1f?sid=c27fe580-6ef3-404e-8c27-12feeeff0861'),
          order: 2,
          status: 'available',
        },
      ],
    },
    {
      id: 'module-10',
      title: 'Cursor Training',
      order: 10,
      lessons: [
        {
          id: 'lesson-10-1',
          title: 'Outbound Workflow 2026',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/e76bed0957a8483f9105ff0a5382a736'),
          order: 1,
          status: 'available',
        },
        {
          id: 'lesson-10-2',
          title: 'Cursor Basics',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/84591563e98b4f2884196c1790701a78'),
          order: 2,
          status: 'available',
        },
        {
          id: 'lesson-10-3',
          title: 'Cursor Example 1 - Clutch Scraper',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/2a39b9d791da42669cc2adabb17f9d2c'),
          order: 3,
          status: 'available',
        },
        {
          id: 'lesson-10-4',
          title: 'Cursor Example 2 - Recently Funded Company Scraper',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/6467e295f6814006b96b1b752db8f1be'),
          order: 4,
          status: 'available',
        },
        {
          id: 'lesson-10-5',
          title: 'Cursor Example 3 - Personalized Lead List Generator',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/398d8b97132b4294b30f93b70d88b9f7'),
          order: 5,
          status: 'available',
        },
      ],
    },
    {
      id: 'module-11',
      title: 'Email Infrastructure & Lead Magnets',
      order: 11,
      lessons: [
        {
          id: 'lesson-11-1',
          title: '2026 - Email Infrastructure Setup',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/18283023ddb346d78fbdedc539747de9'),
          order: 1,
          status: 'available',
        },
        {
          id: 'lesson-11-2',
          title: 'Personalised Automated Lead Magnet Strategy',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/fa69dc13b4f942e6a2d07da5af9719c8'),
          order: 2,
          status: 'available',
        },
      ],
    },
    {
      id: 'module-12',
      title: 'Build your own Clay locally for Free',
      order: 12,
      lessons: [
        {
          id: 'lesson-12-1',
          title: 'Lead Researcher App Demo',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/06488937f6ad48638ed553b53c766c1d'),
          order: 1,
          status: 'available',
        },
        {
          id: 'lesson-12-2',
          title: 'How to setup the Lead Researcher App (local Clay)',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/a9205d3a372b48e78897190b8be9e27a'),
          order: 2,
          status: 'available',
          driveLinks: [
            'https://docs.google.com/document/d/16JqqKADH2V1EM2VgO02g_TNSte-pZ-nbHuA8OoYWtO4/',
            'https://drive.google.com/drive/folders/1S3FJ-vNXFrQicD_0tDZVEFVDV8x9p_Xv?usp=sharing',
          ],
        },
      ],
    },
    {
      id: 'module-13',
      title: 'Sales Call Recording - Closing High Ticket Client Deals',
      order: 13,
      lessons: [
        {
          id: 'lesson-13-1',
          title: 'How I closed a Hungary Client for $2500',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/694ea963197740aaada6a8d83497f544'),
          order: 1,
          status: 'available',
        },
        {
          id: 'lesson-13-2',
          title: 'How I closed a US Client for $3000',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/36f24900f1e845a498b9a80739757735'),
          order: 2,
          status: 'available',
        },
      ],
    },
    {
      id: 'module-14',
      title: 'Instagram Outbound Setup Process',
      order: 14,
      lessons: [
        {
          id: 'lesson-14-1',
          title: 'Video 1 - Overview of this Outbound Setup',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/7f809c9c9686481da94edb3d0c3851a8'),
          order: 1,
          status: 'available',
        },
        {
          id: 'lesson-14-2',
          title: 'Video 2 - How to setup this Instagram Outbound system for FREE',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/beda639b5be5451dab8cbbeb6ff74573'),
          order: 2,
          status: 'available',
        },
        {
          id: 'lesson-14-3',
          title: 'Video 3 - How to create this OpenSource Instagram Outbound system using Cursor?',
          loomUrl: getLoomEmbedUrl('https://www.loom.com/share/e2dd47add4de43c386f212d5b569ac08'),
          order: 3,
          status: 'available',
          driveLinks: [
            'https://docs.google.com/document/d/1E1CkesU5Fc3QiEevBmJdX3jh65kFgDeoZ0wuEzUtCxc/edit?usp=sharing',
            'https://drive.google.com/drive/folders/1mt3-f8aM7OB32rMkO1GpoUJlN2Z-Nmwx?usp=sharing',
          ],
        },
      ],
    },
  ],
};

const globalResources = [
  {
    id: 'resource-outbound-guide',
    title: 'Outbound Guide',
    url: 'https://navy-professor-355.notion.site/Intent-Based-Cold-Email-Guide-a85e565282c245eabd6b80a31c0bf050',
    type: 'notion',
    category: 'guide',
    description: 'Intent-Based Cold Email Guide',
    is_global: true,
  },
  {
    id: 'resource-lead-databases',
    title: 'Lead Databases',
    url: 'https://drive.google.com/drive/folders/1X1I1ilyPQrWMo689gSa4_v2FuXgkCzXp?usp=sharing',
    type: 'drive',
    category: 'database',
    description: 'Lead databases and resources',
    is_global: true,
  },
  {
    id: 'resource-lead-reply-slack',
    title: 'Lead Reply Slack Notifier',
    url: 'https://drive.google.com/file/d/1bpYs-fra2Dhxq9p7VTvgZTbBh6XTPNC_/view?usp=sharing',
    type: 'file',
    category: 'template',
    description: 'N8N/Make.com Automation Blueprint',
    is_global: true,
  },
  {
    id: 'resource-linkedin-engagement',
    title: 'LinkedIn Engagement Outreach Agent',
    url: 'https://drive.google.com/file/d/1_Ma7CdpmLE0B1HiGILaaNKEPAQ2-lfl5/view?usp=sharing',
    type: 'file',
    category: 'template',
    description: 'N8N/Make.com Automation Blueprint',
    is_global: true,
  },
  {
    id: 'resource-linkedin-ghostwriting',
    title: 'LinkedIn Ghostwriting Agent',
    url: 'https://drive.google.com/drive/folders/1mTfXWhYs0vjv88c_YjXHWEukZT0xAPhW?usp=sharing',
    type: 'drive',
    category: 'template',
    description: 'N8N/Make.com Automation Blueprint',
    is_global: true,
  },
];

async function migrate() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🚀 Starting course data migration...\n');

  // Store mapping of old IDs to new UUIDs
  const moduleIdMap = {};
  const lessonIdMap = {};

  // 1. Insert modules
  console.log('📦 Migrating modules...');
  for (const module of courseData.modules) {
    const { data, error } = await supabase
      .from('modules')
      .insert({
        title: module.title,
        description: null,
        order_index: module.order,
        is_published: true,
      })
      .select()
      .single();

    if (error) {
      console.error(`  ❌ Failed to insert module "${module.title}":`, error.message);
      continue;
    }

    moduleIdMap[module.id] = data.id;
    console.log(`  ✅ Module ${module.order}: ${module.title}`);
  }

  // 2. Insert lessons
  console.log('\n📚 Migrating lessons...');
  for (const module of courseData.modules) {
    const newModuleId = moduleIdMap[module.id];
    if (!newModuleId) continue;

    for (const lesson of module.lessons) {
      const { data, error } = await supabase
        .from('lessons')
        .insert({
          module_id: newModuleId,
          title: lesson.title,
          description: null,
          loom_url: lesson.loomUrl || null,
          duration: null,
          order_index: lesson.order,
          status: lesson.status || 'available',
          is_published: true,
        })
        .select()
        .single();

      if (error) {
        console.error(`  ❌ Failed to insert lesson "${lesson.title}":`, error.message);
        continue;
      }

      lessonIdMap[lesson.id] = data.id;
      console.log(`  ✅ Lesson ${module.order}.${lesson.order}: ${lesson.title}`);

      // Insert lesson resources (whimsicalLinks, driveLinks)
      const resources = [];
      
      if (lesson.whimsicalLinks) {
        lesson.whimsicalLinks.forEach((url, idx) => {
          resources.push({
            lesson_id: data.id,
            title: `Whimsical Diagram ${idx + 1}`,
            url,
            type: 'whimsical',
            category: 'diagram',
            order_index: idx + 1,
          });
        });
      }

      if (lesson.driveLinks) {
        lesson.driveLinks.forEach((url, idx) => {
          const isDoc = url.includes('docs.google.com/document');
          resources.push({
            lesson_id: data.id,
            title: isDoc ? `Setup Guide` : `Resources Folder`,
            url,
            type: isDoc ? 'doc' : 'drive',
            category: isDoc ? 'document' : 'database',
            order_index: (lesson.whimsicalLinks?.length || 0) + idx + 1,
          });
        });
      }

      if (resources.length > 0) {
        const { error: resError } = await supabase
          .from('resources')
          .insert(resources);

        if (resError) {
          console.error(`    ⚠️ Failed to insert resources for "${lesson.title}":`, resError.message);
        } else {
          console.log(`    📎 Added ${resources.length} resource(s)`);
        }
      }
    }
  }

  // 3. Insert global resources
  console.log('\n🌐 Migrating global resources...');
  for (const resource of globalResources) {
    const { error } = await supabase
      .from('resources')
      .insert({
        title: resource.title,
        url: resource.url,
        type: resource.type,
        category: resource.category,
        description: resource.description,
        is_global: true,
        order_index: globalResources.indexOf(resource) + 1,
      });

    if (error) {
      console.error(`  ❌ Failed to insert resource "${resource.title}":`, error.message);
    } else {
      console.log(`  ✅ ${resource.title}`);
    }
  }

  console.log('\n✨ Migration complete!');
  console.log(`   Modules: ${Object.keys(moduleIdMap).length}`);
  console.log(`   Lessons: ${Object.keys(lessonIdMap).length}`);
  console.log(`   Global Resources: ${globalResources.length}`);
}

migrate().catch(console.error);

