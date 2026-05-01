(function () {
  const API_BASE_URL = 'http://localhost:3000';
  const DEFAULT_LIMIT = 10;

  const params = new URLSearchParams(window.location.search);
  const currentPage = toPositiveInteger(params.get('page'), 1);
  const query = (params.get('q') || '').trim();

  document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('job-list')) {
      loadListings();
    }

    if (document.getElementById('job-detail')) {
      loadJobDetail();
    }
  });

  async function loadListings() {
    const list = document.getElementById('job-list');
    const status = document.getElementById('status');
    const summary = document.getElementById('result-summary');
    const pagination = document.querySelector('.pagination');
    const searchInput = document.getElementById('search-input');

    searchInput.value = query;
    setStatus(status, 'Loading jobs...');
    list.innerHTML = '';
    pagination.innerHTML = '';

    try {
      const endpoint = query ? '/jobs/search' : '/jobs';
      const apiParams = new URLSearchParams({
        page: String(currentPage),
        limit: String(DEFAULT_LIMIT),
      });

      if (query) {
        apiParams.set('q', query);
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}?${apiParams.toString()}`);
      const payload = await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(payload.message || 'Unable to load jobs');
      }

      renderJobs(list, payload.data);
      renderSummary(summary, payload.pagination, query);
      renderPagination(pagination, payload.pagination, query);
      setStatus(status, payload.data.length === 0 ? 'No jobs found' : '');
    } catch (error) {
      setStatus(status, error.message || 'Unable to load jobs', true);
    }
  }

  async function loadJobDetail() {
    const detail = document.getElementById('job-detail');
    const status = document.getElementById('status');
    const id = params.get('id');

    if (!id) {
      setStatus(status, 'Job ID is required', true);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${encodeURIComponent(id)}`);
      const job = await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(job.message || 'Unable to load job');
      }

      detail.innerHTML = `
        <h1>${escapeHtml(job.title)}</h1>
        <p class="job-meta">${escapeHtml(job.company)} - ${escapeHtml(job.location)}</p>
        <p class="salary">${job.salary ? escapeHtml(job.salary) : 'Salary not specified'}</p>
        <p class="posted-date">Posted ${formatDate(job.created_at)}</p>
        <section>
          <h2>Description</h2>
          <p>${escapeHtml(job.description)}</p>
        </section>
      `;
      detail.classList.add('is-visible');
      setStatus(status, '');
    } catch (error) {
      setStatus(status, error.message || 'Unable to load job', true);
    }
  }

  function renderJobs(list, jobs) {
    list.innerHTML = jobs
      .map(function (job) {
        return `
          <article class="job-card">
            <h2>${escapeHtml(job.title)}</h2>
            <p class="job-meta">${escapeHtml(job.company)}</p>
            <p class="job-meta">${escapeHtml(job.location)}</p>
            <p class="salary">${job.salary ? escapeHtml(job.salary) : 'Salary not specified'}</p>
            <a class="view-link" href="job.html?id=${encodeURIComponent(job.id)}">View Details</a>
          </article>
        `;
      })
      .join('');
  }

  function renderSummary(summary, pagination, searchTerm) {
    const label = pagination.total === 1 ? 'job' : 'jobs';
    summary.textContent = searchTerm
      ? `${pagination.total} ${label} found for "${searchTerm}"`
      : `${pagination.total} ${label} available`;
  }

  function renderPagination(container, pagination, searchTerm) {
    if (pagination.totalPages <= 1) {
      return;
    }

    container.appendChild(createPageLink('Previous', pagination.page - 1, searchTerm, pagination.page === 1));

    for (let page = 1; page <= pagination.totalPages; page += 1) {
      container.appendChild(createPageLink(String(page), page, searchTerm, false, page === pagination.page));
    }

    container.appendChild(
      createPageLink('Next', pagination.page + 1, searchTerm, pagination.page === pagination.totalPages),
    );
  }

  function createPageLink(label, page, searchTerm, disabled, isCurrent) {
    const link = document.createElement('a');
    link.className = 'page-button';
    link.textContent = label;

    if (isCurrent) {
      link.setAttribute('aria-current', 'page');
    }

    if (disabled) {
      link.setAttribute('aria-disabled', 'true');
      link.tabIndex = -1;
      link.href = '#';
      return link;
    }

    const nextParams = new URLSearchParams({ page: String(page) });
    if (searchTerm) {
      nextParams.set('q', searchTerm);
    }
    link.href = `index.html?${nextParams.toString()}`;

    return link;
  }

  async function parseJsonResponse(response) {
    try {
      return await response.json();
    } catch (_error) {
      return {};
    }
  }

  function setStatus(element, message, isError) {
    element.textContent = message;
    element.classList.toggle('error', Boolean(isError));
    element.hidden = message === '';
  }

  function toPositiveInteger(value, fallback) {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
  }

  function formatDate(value) {
    if (!value) {
      return 'date unavailable';
    }

    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(value));
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
