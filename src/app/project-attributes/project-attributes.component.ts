import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { RoadWorkProjectService } from 'src/services/roadwork_project.service';
import { UserService } from 'src/services/user.service';
import { RoadWorkProjectFeature } from '../../model/road-work-project-feature';

@Component({
  selector: 'app-project-attributes',
  templateUrl: './project-attributes.component.html',
  styleUrls: ['./project-attributes.component.css']
})
export class ProjectAttributesComponent implements OnInit {

  roadWorkProjectFeature?: RoadWorkProjectFeature;

  userService: UserService;

  private roadWorkProjectService: RoadWorkProjectService;
  private activatedRoute: ActivatedRoute;
  private activatedRouteSubscription: Subscription = new Subscription();

  constructor(activatedRoute: ActivatedRoute, roadWorkProjectService: RoadWorkProjectService,
        userService: UserService) {
    this.activatedRoute = activatedRoute;
    this.roadWorkProjectService = roadWorkProjectService;
    this.userService = userService;
  }

  ngOnInit() {
    this.activatedRouteSubscription = this.activatedRoute.params
      .subscribe(params => {
        let idParamString: string = params['id'];

        if(idParamString == "new"){

          this.roadWorkProjectFeature = new RoadWorkProjectFeature();
          this.roadWorkProjectFeature.properties.uuid = -1;

        } else {

          let constProjId: number = parseInt(params['id']);

          this.roadWorkProjectService.getRoadWorkProjects(constProjId)
                  .subscribe({
            next: (roadWorkProjectService) => {
              if(roadWorkProjectService.length === 1){
                let constructionprojectObs: RoadWorkProjectFeature
                      = roadWorkProjectService[0];
      
                this.roadWorkProjectFeature = constructionprojectObs;
    
              }    
            },
            error: (error) => {
            }});

        }

      });

  }

  validateElement1() {
    let validateButton1 = document.getElementById("validateButton1");
    if(validateButton1 != null)
      validateButton1.style.backgroundColor = "lightgreen";
    let expansionPanel1 = document.getElementById("expansionPanel1");
    if(expansionPanel1 != null)
      expansionPanel1.style.backgroundColor = "rgb(238, 255, 238)";
  }

  validateElement3() {
    let validateButton3 = document.getElementById("validateButton3");
    if(validateButton3 != null)
      validateButton3.style.backgroundColor = "lightgreen";
    let expansionPanel3 = document.getElementById("expansionPanel3");
    if(expansionPanel3 != null)
      expansionPanel3.style.backgroundColor = "rgb(238, 255, 238)";
    // this.validateElement2();
  }

  validateElement4() {
    let validateButton4 = document.getElementById("validateButton4");
    if(validateButton4 != null)
      validateButton4.style.backgroundColor = "lightgreen";
    let expansionPanel4 = document.getElementById("expansionPanel4");
    if(expansionPanel4 != null)
      expansionPanel4.style.backgroundColor = "rgb(238, 255, 238)";
    this.validateElement2();
  }

  validateElement2() {
    let validateButton3 = document.getElementById("validateButton3");
    let validateButton4 = document.getElementById("validateButton4");
    if (validateButton3!= null && validateButton3.style.backgroundColor === "lightgreen" &&
      validateButton4 != null && validateButton4.style.backgroundColor === "lightgreen") {
      let expansionPanel2 = document.getElementById("expansionPanel2");
      if(expansionPanel2 != null)
        expansionPanel2.style.backgroundColor = "rgb(238, 255, 238)";
    }
  }

  ngOnDestroy() {
    this.activatedRouteSubscription.unsubscribe();
  }

}
