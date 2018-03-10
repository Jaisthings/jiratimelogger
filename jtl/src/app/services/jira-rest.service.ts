import { Injectable } from '@angular/core';
import {HttpClient,HttpHeaders} from "@angular/common/http";
import {Storage} from "../utils/storage";
import { Observable } from 'rxjs/Observable';
import { JiraResponseWrapper } from '../stubs/jira';

@Injectable()
export class JiraRestService {

  //Jira Host constants
  jiraRestUrl:string = "/rest/api/2";
  
  //api endpoints
  searchIssuesEndPoint = "/search?jql=";
  addWorkLogEndPoint = "/worklog";
  changeStatusEndPoint = "/transitions";
  transitionIDForClose = "51";

  constructor(private httpClient:HttpClient, private storage:Storage) { }


  getTasks():Observable<JiraResponseWrapper>{
    let jiraDefaultSearchQueryString = `assignee = ${this.storage.getUserName()} and status not in ('Resolved','Closed','Completed','Close','Cancelled') and issueType in ('Task')`;
    let url = this.storage.getJiraHost()+this.jiraRestUrl+this.searchIssuesEndPoint+jiraDefaultSearchQueryString; 
    return this.httpClient.get<JiraResponseWrapper>(url,{headers:this.buildHeaders()});
  }

  addWorkLog(issueKey:string,timeInSeconds:number):void{
    if(timeInSeconds > 60){ //Ensuring a minimum of 1 minute is logged against the task
      let url = this.storage.getJiraHost()+this.jiraRestUrl+"/issues/"+issueKey+this.addWorkLogEndPoint;
      let body = {timeSpentSeconds:timeInSeconds};
      this.httpClient.post(url,JSON.stringify(body),{headers:this.buildHeaders()})
                        .subscribe(data=> console.log(data),error => console.log(error));
    }
  }

  closeIssue(issueKey:string):void{
    let url = this.storage.getJiraHost()+this.jiraRestUrl+"/issues/"+issueKey+this.changeStatusEndPoint;
    let body = {"transition":{"id":this.transitionIDForClose}};
    this.httpClient.post(url,JSON.stringify(body),{headers:this.buildHeaders()})
                        .subscribe(data=> console.log(data),error => console.log(error));
  }

  buildHeaders():HttpHeaders{
    let requestHeaders:HttpHeaders = new HttpHeaders();
    requestHeaders = requestHeaders.set("Accept","application/json")
                    .set("Content-Type","application/json")
                      .set("Authorization",
                          "Basic "+window.btoa(this.storage.getUserName()+":"+this.storage.getPassphrase()));
    return requestHeaders;
  }

}
