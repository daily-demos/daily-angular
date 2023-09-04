import { Component } from "@angular/core";

@Component({
  selector: "app-daily-container",
  templateUrl: "./daily-container.component.html",
  styleUrls: ["./daily-container.component.css"],
})
export class DailyContainerComponent {
  // Store callObject in this parent container.
  // Most callObject logic in CallComponent.
  userName: string;
  dailyRoomUrl: string;

  setUserName(name: string): void {
    // Event is emitted from JoinForm
    this.userName = name;
  }

  setUrl(url: string): void {
    // Event is emitted from JoinForm
    this.dailyRoomUrl = url;
  }

  callEnded(): void {
    // Truthy value will show the CallComponent; otherwise, the JoinFormComponent is shown.
    this.dailyRoomUrl = "";
    this.userName = "";
  }
}
