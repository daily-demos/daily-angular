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

export type Participant = {
  videoStream?: MediaStream | undefined | null;
  audioStream?: MediaStream | undefined | null;
  videoOn: boolean;
  audioOn: boolean;
  userName: string;
  local: boolean;
  id: string;
};

type Participants = Array<Participant>;

@Component({
  selector: "app-call",
  templateUrl: "./call.component.html",
  styleUrls: ["./call.component.css"],
})
export class CallComponent {
  @Input() callObject: DailyCall;
  @Output() callEnded: EventEmitter<null> = new EventEmitter();
  error: string = "";
  participants: Participants = [];
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

  formatParticipantObj(p: DailyParticipant): Participant {
    const { video, audio } = p.tracks;
    return {
      videoStream: video?.persistentTrack
        ? new MediaStream([video.persistentTrack])
        : null,
      audioStream: audio?.persistentTrack
        ? new MediaStream([audio.persistentTrack])
        : null,
      videoOn: video.state === "playable",
      audioOn: audio.state === "playable",
      userName: p.user_name,
      local: p.local,
      id: p.session_id,
    };
  }

  addNewParticipant(participant: DailyParticipant) {
    const p = this.formatParticipantObj(participant);
    this.participants.push(p);
  }

  findParticipant(participant: DailyParticipant): Participant {
    return this.participants.filter(
      (p) => p.id === participant.session_id
    )?.[0];
  }

  replaceParticipant(participant: DailyParticipant): void {
    const index = this.participants.findIndex(
      (p: Participant) => p.id === participant.session_id
    );
    console.log(index);
    this.participants[index] = this.formatParticipantObj(participant);
  }

  updateParticipantAsNeeded(participant: DailyParticipant): void {
    const currentParticipant = this.findParticipant(participant);
    console.log(currentParticipant);

    const { video } = participant.tracks;
    const { audio } = participant.tracks;
    const videoIsPlayable = video.state === "playable";
    const audioIsPlayable = audio.state === "playable";
    console.log(currentParticipant.videoOn, videoIsPlayable);
    if (
      currentParticipant.videoOn !== videoIsPlayable ||
      currentParticipant.audioOn !== audioIsPlayable
    ) {
      this.replaceParticipant(participant);
    }
  }

  updateParticipantInList(sessionId: string, key: string): void {}

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
    this.addNewParticipant(e.participants.local);
  };

  participantJoined = (e: DailyEventObjectParticipant | undefined) => {
    if (!e) return;
    console.log(e.action);
    // Add remote participants to participants list used to display video tiles
    this.addNewParticipant(e.participant);
  };

  updateParticipants = (e: DailyEventObjectParticipant | undefined): void => {
    if (!e) return;
    // This is sometimes emitted before joined-meeting
    if (!this.joined) return;

    // Note: This event is triggered often and can cause performance issues if it results in rerendering media every time.

    this.updateParticipantAsNeeded(e.participant);
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
