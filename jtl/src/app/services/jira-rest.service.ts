import { Injectable } from '@angular/core';
import {HttpClient,HttpHeaders} from "@angular/common/http";
import {Storage} from "../utils/storage";
import { Observable } from 'rxjs/Observable';
import { JiraResponseWrapper } from '../stubs/jira';
import { HttpResponse } from 'selenium-webdriver/http';
import { error } from 'util';
import { utils } from 'protractor';
import { Response } from '_debugger';

@Injectable()
export class JiraRestService {

  //Jira Host constants
  jiraRestUrl:string = "/rest/api/latest";
  
  //api endpoints/constants
  searchIssuesEndPoint = "/search?jql=";
  addWorkLogEndPoint = "/worklog";
  changeStatusEndPoint = "/transitions";
  permissionsEndPoint = "/mypermissions";
  transitionIDForDone = "31";

  constructor(private httpClient:HttpClient, private storage:Storage) { }


  getTasks():Observable<HttpResponse>{
    //Default JQL Filter strings
    let stdFilterString:string = " and status in ('In Progress') and issuetype in ('Sub-task') order by key ASC";
  
    let jiraSearchQueryString = this.storage.getJiraQuery() + stdFilterString;
    let url = this.storage.getJiraHost()+this.jiraRestUrl+this.searchIssuesEndPoint+jiraSearchQueryString; 
    return this.httpClient.get(url,{headers:this.buildHeaders(),observe:'response'});
  }

  addWorkLog(issueKey:string,timeInSeconds:number):Observable<HttpResponse>{
      let url = this.storage.getJiraHost()+this.jiraRestUrl+"/issue/"+issueKey+this.addWorkLogEndPoint;
      let body = {timeSpentSeconds:timeInSeconds};
      return this.httpClient.post(url,JSON.stringify(body),{headers:this.buildHeaders(),observe:'response'});
  }

  closeIssue(issueKey:string):Observable<HttpResponse>{
    let url = this.storage.getJiraHost()+this.jiraRestUrl+"/issue/"+issueKey+this.changeStatusEndPoint;
    let body = {"transition":{"id":this.transitionIDForDone}};
    return this.httpClient.post(url,JSON.stringify(body),{headers:this.buildHeaders(),observe:'response'});
  }

  testConnection():void{
    let url = this.storage.getJiraHost()+this.jiraRestUrl+this.permissionsEndPoint;
    this.httpClient.get(url,{headers:this.buildHeaders(),observe:"response"})
                      .subscribe((res)=>{
                          if(res.status == 200){
                            let uname:string = res.headers.get("x-ausername");
                            if(this.storage.getUserName() != null && uname != null &&
                                  this.storage.getUserName().toUpperCase() == uname.toUpperCase()){
                                    //User Authenticated
                                    this.storage.setConnectionSuccessful(true);
                                  }else{
                                    this.storage.setConnectionSuccessful(false);
                                  }
                          }else{
                            console.log("Connection Unsuccessful/Unauthorized");
                            this.storage.setConnectionSuccessful(false);
                          }
                      },
                    error=>{
                      console.log("Connection Unsuccessful/Unauthorized");
                            this.storage.setConnectionSuccessful(false);
                    });
  }

  buildHeaders():HttpHeaders{
    let requestHeaders:HttpHeaders = new HttpHeaders();
    requestHeaders = requestHeaders.set("Accept","application/json")
                    .set("Content-Type","application/json")
                      .set("Authorization",
                          "Basic "+window.btoa(this.storage.getUserName()+":"+this.storage.getPassphrase()));
                            console.log(requestHeaders);
    return requestHeaders;
  }

}
