import { Injectable } from '@angular/core';
import {HttpClient,HttpHeaders} from "@angular/common/http";
import {Storage} from "../utils/storage";
import { Observable } from 'rxjs/Observable';
import { JiraResponseWrapper } from '../stubs/jira';
import { HttpResponse } from 'selenium-webdriver/http';
import { error } from 'util';

@Injectable()
export class JiraRestService {

  //Jira Host constants
  jiraRestUrl:string = "/rest/api/latest";
  
  //api endpoints
  searchIssuesEndPoint = "/search?jql=";
  addWorkLogEndPoint = "/worklog";
  changeStatusEndPoint = "/transitions";
  permissionsEndPoint = "/mypermissions";
  transitionIDForClose = "51";

  constructor(private httpClient:HttpClient, private storage:Storage) { }


  getTasks():Observable<JiraResponseWrapper>{
    let jiraSearchQueryString = this.storage.getJiraQuery();
    let url = this.storage.getJiraHost()+this.jiraRestUrl+this.searchIssuesEndPoint+jiraSearchQueryString; 
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

  testConnection():void{
    let url = this.storage.getJiraHost()+this.jiraRestUrl+this.permissionsEndPoint;
    this.httpClient.get(url,{headers:this.buildHeaders(),observe:"response"})
                      .subscribe((res)=>{
                          if(res.status == 200){
                            let uname:string = res.headers.get("x-ausername");
                            if(this.storage.getUserName() != null && 
                                  uname === this.storage.getUserName()){
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
