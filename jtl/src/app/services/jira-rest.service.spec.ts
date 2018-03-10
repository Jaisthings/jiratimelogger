import { TestBed, inject } from '@angular/core/testing';

import { JiraRestService } from './jira-rest.service';

describe('JiraRestService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JiraRestService]
    });
  });

  it('should be created', inject([JiraRestService], (service: JiraRestService) => {
    expect(service).toBeTruthy();
  }));
});
