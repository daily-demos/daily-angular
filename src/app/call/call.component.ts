import { Component, EventEmitter, Input, Output } from "@angular/core";
import {
  DailyCall,
  DailyEventObjectParticipant,
  DailyParticipant,
  DailyEventObjectFatalError,
  DailyEventObjectParticipants,
  DailyEventObjectNoPayload,
  DailyEventObjectParticipantLeft,
} from "@daily-co/daily-js";

@Component({
  selector: "app-call",
  templateUrl: "./call.component.html",
  styleUrls: ["./call.component.css"],
})
export class CallComponent {
  @Input() callObject: DailyCall;
  @Output() callEnded: EventEmitter<null> = new EventEmitter();
  error: string = "";
  participants: Array<DailyParticipant> = [];
  isPublic: boolean = true;
  joined: boolean = false;
  name: string = "";

  ngOnInit(): void {
    if (!this.callObject) return;
    // Add event listeners for Daily events
    this.callObject
      .on("joining-meeting", this.handleJoiningMeeting)
      .on("joined-meeting", this.handleJoinedMeeting)
      .on("participant-joined", this.participantJoined)
      .on("participant-updated", this.updateParticipants)
      .on("participant-left", this.handleParticipantLeft)
      .on("left-meeting", this.handleLeftMeeting)
      .on("error", this.handleError);
  }

  ngOnDestroy(): void {
    if (!this.callObject) return;
    // Remove event listeners for Daily events
    this.callObject
      .off("joining-meeting", this.handleJoiningMeeting)
      .off("joined-meeting", this.handleJoinedMeeting)
      .off("participant-joined", this.participantJoined)
      .off("participant-updated", this.updateParticipants)
      .off("participant-left", this.handleParticipantLeft)
      .off("left-meeting", this.handleLeftMeeting)
      .off("error", this.handleError);
  }

  handleJoiningMeeting(e: DailyEventObjectNoPayload | undefined): void {
    // No action needed
    console.log(e?.action);
  }

  handleJoinedMeeting = (e: DailyEventObjectParticipants | undefined): void => {
    if (!e) return; // make TypeScript happy
    console.log(e);
    this.joined = true;

    const { access } = this.callObject.accessState();

    // Set flag if room is public. If it's not, we'll alert the user in the UI.
    // Rooms should be public since this demo does not include access management.
    this.isPublic = access !== "unknown" && access.level === "full";
    // Add local participants to participants list used to display video tiles
    this.participants.push(e.participants.local);
  };

  participantJoined = (e: DailyEventObjectParticipant | undefined) => {
    if (!e) return;
    console.log(e.action);
    // Add remote participants to participants list used to display video tiles
    this.participants.push(e.participant);
  };

  updateParticipants = (e: DailyEventObjectParticipant | undefined): void => {
    if (!e) return;

    // Note: This event is triggered often.
    // Replace participant object with updated version.
    // In more performance-concerned apps, you can check if the change is relevant before replacing it.
    const index = this.participants.findIndex(
      (p: any) => p.session_id === e.participant.session_id
    );
    this.participants[index] = e.participant;
  };

  handleParticipantLeft = (
    e: DailyEventObjectParticipantLeft | undefined
  ): void => {
    if (!e) return;
    console.log(e.action);
    // Remove the participant who left the call from the UI.
    const index = this.participants.findIndex(
      (p: any) => p.session_id === e.participant.session_id
    );
    this.participants.splice(index, 1);
  };

  handleError = (e: DailyEventObjectFatalError | undefined): void => {
    if (!e) return;
    console.log(e);
    // Update local error message displayed in UI.
    this.error = e.errorMsg;
  };

  handleLeftMeeting = (e: DailyEventObjectNoPayload | undefined): void => {
    if (!e) return;
    console.log(e);
    this.joined = false;
    this.callObject.destroy();
    this.callEnded.emit();
  };

  leaveCall(): void {
    this.error = "";
    if (!this.callObject) return;

    console.log("leaving/destroying call object");
    // Leave call
    this.callObject.leave();
  }

  toggleLocalVideo() {
    // Event is emitted from VideoTileComponent

    // Confirm they're in the call before updating media
    if (!this.joined) return;
    // Toggle current audio state
    const videoOn = this.callObject.localVideo();
    this.callObject.setLocalVideo(!videoOn);
  }

  toggleLocalAudio() {
    // Event is emitted from VideoTileComponent

    // Confirm they're in the call before updating media
    if (!this.joined) return;
    // Toggle current audio state
    const audioOn = this.callObject.localAudio();
    this.callObject.setLocalAudio(!audioOn);
  }
}
