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
  videoTrack?: MediaStreamTrack | undefined;
  audioTrack?: MediaStreamTrack | undefined;
  videoOn: boolean;
  audioOn: boolean;
  userName: string;
  local: boolean;
  id: string;
};

type Participants = {
  [key: string]: Participant;
};

@Component({
  selector: "app-call",
  templateUrl: "./call.component.html",
  styleUrls: ["./call.component.css"],
})
export class CallComponent {
  Object = Object;
  @Input() callObject: DailyCall;
  @Output() callEnded: EventEmitter<null> = new EventEmitter();
  error: string = "";
  participants: Participants = {};
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

  // Make a copy of the participant information we're actually interested in to simplify things.
  formatParticipantObj(p: DailyParticipant): Participant {
    const { video, audio } = p.tracks;
    return {
      videoTrack: video?.persistentTrack,
      audioTrack: audio?.persistentTrack,
      videoOn: video.state === "playable",
      audioOn: audio.state === "playable",
      userName: p.user_name,
      local: p.local,
      id: p.session_id,
    };
  }

  addParticipant(participant: DailyParticipant) {
    const p = this.formatParticipantObj(participant);
    this.participants[participant.session_id] = p;
  }

  updateParticipantAsNeeded(participant: DailyParticipant): void {
    const currentParticipant = this.participants[participant.session_id];

    const { video } = participant.tracks;
    const { audio } = participant.tracks;
    const videoIsPlayable = video.state === "playable";
    const audioIsPlayable = audio.state === "playable";

    // Only the video/audio can change currently (not the name or if they're local), so we check for those changes.
    if (currentParticipant.videoOn !== videoIsPlayable) {
      currentParticipant.videoOn = videoIsPlayable;
    }
    if (currentParticipant.audioOn !== audioIsPlayable) {
      currentParticipant.audioOn = audioIsPlayable;
    }
    if (currentParticipant.videoTrack?.id !== video.persistentTrack?.id) {
      currentParticipant.videoTrack = video.persistentTrack;
    }
    if (currentParticipant.audioTrack?.id !== audio.persistentTrack?.id) {
      currentParticipant.audioTrack = audio.persistentTrack;
    }
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
    this.addParticipant(e.participants.local);
  };

  participantJoined = (e: DailyEventObjectParticipant | undefined) => {
    if (!e) return;
    console.log(e.action);
    // Add remote participants to participants list used to display video tiles
    this.addParticipant(e.participant);
  };

  updateParticipants = (e: DailyEventObjectParticipant | undefined): void => {
    if (!e) return;
    // This is sometimes emitted before joined-meeting
    if (!this.joined) return;

    // Note: This event is triggered often and can cause performance issues if it results in rerendering child components every time it's emitted.

    this.updateParticipantAsNeeded(e.participant);
  };

  handleParticipantLeft = (
    e: DailyEventObjectParticipantLeft | undefined
  ): void => {
    if (!e) return;
    console.log(e.action);

    delete this.participants[e.participant.session_id];
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
