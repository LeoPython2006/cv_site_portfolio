const root = document.documentElement;
const themeButton = document.querySelector('.theme-toggle');
const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const header = document.querySelector('.site-header');

const savedTheme = localStorage.getItem('portfolio-theme');
if (savedTheme === 'light' || savedTheme === 'dark') {
  root.dataset.theme = savedTheme;
} else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
  root.dataset.theme = 'light';
}

themeButton?.addEventListener('click', () => {
  const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = nextTheme;
  localStorage.setItem('portfolio-theme', nextTheme);
});

menuButton?.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.nav-links a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 16);
}, { passive: true });

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

document.getElementById('year').textContent = new Date().getFullYear();

const eventNames = {
  PushEvent: 'Code update',
  PullRequestEvent: 'Pull request',
  IssuesEvent: 'Issue',
  CreateEvent: 'Created',
  ForkEvent: 'Fork',
  WatchEvent: 'Starred',
  ReleaseEvent: 'Release',
  IssueCommentEvent: 'Discussion'
};

function relativeTime(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  const ranges = [
    [31536000, 'year'], [2592000, 'month'], [86400, 'day'],
    [3600, 'hour'], [60, 'minute'], [1, 'second']
  ];

  for (const [unitSeconds, unit] of ranges) {
    const value = Math.floor(seconds / unitSeconds);
    if (value >= 1) return `${value} ${unit}${value === 1 ? '' : 's'} ago`;
  }
  return 'just now';
}

function describeEvent(event) {
  const repo = event.repo?.name || 'GitHub';
  const type = eventNames[event.type] || 'Activity';
  let detail = 'Public contribution';

  if (event.type === 'PushEvent') {
    const count = event.payload?.size || event.payload?.commits?.length || 1;
    detail = `${count} commit${count === 1 ? '' : 's'}`;
  } else if (event.type === 'PullRequestEvent') {
    detail = event.payload?.action ? `${event.payload.action} pull request` : 'Pull request activity';
  } else if (event.type === 'IssuesEvent') {
    detail = event.payload?.action ? `${event.payload.action} issue` : 'Issue activity';
  } else if (event.type === 'CreateEvent') {
    detail = event.payload?.ref_type ? `Created ${event.payload.ref_type}` : 'Created repository resource';
  }

  return { repo, type, detail };
}

async function loadGitHubData() {
  const feed = document.getElementById('activity-feed');
  try {
    const [profileResponse, eventsResponse] = await Promise.all([
      fetch('https://api.github.com/users/LeoVesinML'),
      fetch('https://api.github.com/users/LeoVesinML/events/public?per_page=6')
    ]);

    if (!profileResponse.ok || !eventsResponse.ok) throw new Error('GitHub API request failed');

    const profile = await profileResponse.json();
    const events = await eventsResponse.json();

    document.getElementById('repo-count').textContent = profile.public_repos ?? '—';
    document.getElementById('follower-count').textContent = profile.followers ?? '—';
    document.getElementById('profile-year').textContent = profile.created_at
      ? new Date(profile.created_at).getFullYear()
      : '2023';

    if (!Array.isArray(events) || events.length === 0) {
      feed.innerHTML = '<div class="activity-placeholder">No recent public activity is available.</div>';
      return;
    }

    feed.innerHTML = events.slice(0, 5).map((event) => {
      const item = describeEvent(event);
      return `
        <a class="activity-item" href="https://github.com/${item.repo}" target="_blank" rel="noreferrer">
          <span class="activity-type">${item.type}</span>
          <span class="activity-title"><strong>${item.repo}</strong><span>${item.detail}</span></span>
          <span class="activity-time">${relativeTime(event.created_at)}</span>
        </a>`;
    }).join('');
  } catch (error) {
    feed.innerHTML = '<div class="activity-placeholder">Live GitHub data is temporarily unavailable. Visit the GitHub profile directly.</div>';
  }
}

loadGitHubData();
