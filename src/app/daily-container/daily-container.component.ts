import { Component } from "@angular/core";
import { DailyCall } from "@daily-co/daily-js";

@Component({
  selector: "app-daily-container",
  templateUrl: "./daily-container.component.html",
  styleUrls: ["./daily-container.component.css"],
})
export class DailyContainerComponent {
  // Store callObject in this parent container.
  // Most callObject logic in CallComponent.
  callObject: DailyCall | null;
  userName: string;
  dailyRoomUrl: string;

  setCallObject(co: DailyCall): void {
    // Event is emitted from CallComponent
    this.callObject = co;
  }

  setName(name: string): void {
    // Event is emitted from CallComponent
    this.userName = name;
  }

  setUrl(url: string): void {
    // Event is emitted from CallComponent
    this.dailyRoomUrl = url;
  }

  callEnded(): void {
    // Event is emitted from CallComponent
    console.log("resetting call object in container");
    // Truthy value will show the CallComponent; otherwise, the JoinFormComponent is shown.
    this.callObject = null;
  }
}
