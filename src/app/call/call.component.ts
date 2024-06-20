import { Component, EventEmitter, Input, Output } from "@angular/core";
import DailyIframe, {
  DailyCall,
  DailyEventObjectParticipant,
  DailyParticipant,
  DailyEventObjectFatalError,
  DailyEventObjectParticipants,
  DailyEventObjectNoPayload,
  DailyEventObjectParticipantLeft,
  DailyEventObjectTrack,
} from "@daily-co/daily-js";

export type Participant = {
  videoTrack?: MediaStreamTrack | undefined;
  audioTrack?: MediaStreamTrack | undefined;
  videoReady: boolean;
  audioReady: boolean;
  userName: string;
  local: boolean;
  id: string;
};

const PLAYABLE_STATE = "playable";
const LOADING_STATE = "loading";

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
  @Input() dailyRoomUrl: string;
  @Input() userName: string;
  @Output() callEnded: EventEmitter<null> = new EventEmitter();
  callObject: DailyCall | undefined;
  error: string = "";
  participants: Participants = {};
  isPublic: boolean = true;
  joined: boolean = false;

  ngOnInit(): void {
    // Retrieve or create the call object
    this.callObject = DailyIframe.getCallInstance();
    if (!this.callObject) {
      this.callObject = DailyIframe.createCallObject();
    }

    // Add event listeners for Daily events
    this.callObject
      .on("joined-meeting", this.handleJoinedMeeting)
      .on("participant-joined", this.participantJoined)
      .on("track-started", this.handleTrackStartedStopped)
      .on("track-stopped", this.handleTrackStartedStopped)
      .on("participant-left", this.handleParticipantLeft)
      .on("left-meeting", this.handleLeftMeeting)
      .on("error", this.handleError);

    // Join Daily call
    this.callObject.join({
      userName: this.userName,
      url: this.dailyRoomUrl,
    });
  }

  ngOnDestroy(): void {
    if (!this.callObject) return;
    // Remove event listeners for Daily events
    this.callObject
      .off("joined-meeting", this.handleJoinedMeeting)
      .off("participant-joined", this.participantJoined)
      .off("track-started", this.handleTrackStartedStopped)
      .off("track-stopped", this.handleTrackStartedStopped)
      .off("participant-left", this.handleParticipantLeft)
      .off("left-meeting", this.handleLeftMeeting)
      .off("error", this.handleError);
  }

  // Make a copy of the participant information we're actually interested in to simplify things.
  // A track is considered ready to play if it's playable or loading. (Loading will be playable very soon!)
  formatParticipantObj(p: DailyParticipant): Participant {
    const { video, audio } = p.tracks;
    const vt = video?.persistentTrack;
    const at = audio?.persistentTrack;
    return {
      videoTrack: vt,
      audioTrack: at,
      videoReady: !!(
        vt &&
        (video.state === PLAYABLE_STATE || video.state === LOADING_STATE)
      ),
      audioReady: !!(
        at &&
        (audio.state === PLAYABLE_STATE || audio.state === LOADING_STATE)
      ),
      userName: p.user_name,
      local: p.local,
      id: p.session_id,
    };
  }

  addParticipant(participant: DailyParticipant) {
    const p = this.formatParticipantObj(participant);
    this.participants[participant.session_id] = p;
  }

  updateTrack(participant: DailyParticipant, newTrackType: string): void {
    const existingParticipant = this.participants[participant.session_id];
    const currentParticipantCopy = this.formatParticipantObj(participant);

    if (newTrackType === "video") {
      if (
        existingParticipant.videoReady !== currentParticipantCopy.videoReady
      ) {
        existingParticipant.videoReady = currentParticipantCopy.videoReady;
      }

      if (
        currentParticipantCopy.videoReady &&
        existingParticipant.videoTrack?.id !==
          currentParticipantCopy.videoTrack?.id
      ) {
        existingParticipant.videoTrack = currentParticipantCopy.videoTrack;
      }
      return;
    }

    if (newTrackType === "audio") {
      if (
        existingParticipant.audioReady !== currentParticipantCopy.audioReady
      ) {
        existingParticipant.audioReady = currentParticipantCopy.audioReady;
      }

      if (
        currentParticipantCopy.audioReady &&
        existingParticipant.audioTrack?.id !==
          currentParticipantCopy.audioTrack?.id
      ) {
        existingParticipant.audioTrack = currentParticipantCopy.audioTrack;
      }
    }
  }

  handleJoinedMeeting = (e: DailyEventObjectParticipants | undefined): void => {
    if (!e || !this.callObject) return;
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

  handleTrackStartedStopped = (e: DailyEventObjectTrack | undefined): void => {
    console.log("track started or stopped");
    if (!e || !e.participant || !this.joined) return;
    this.updateTrack(e.participant, e.type);
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
    if (!e || !this.callObject) return;
    console.log(e);
    this.joined = false;
    this.callObject.destroy();
    this.callEnded.emit();
  };

  leaveCall(): void {
    this.error = "";
    if (!this.callObject) return;

    // Leave call
    this.callObject.leave();
  }

  toggleLocalVideo() {
    // Event is emitted from VideoTileComponent

    // Confirm they're in the call before updating media
    if (!this.joined || !this.callObject) return;

    // Toggle current audio state
    const videoReady = this.callObject.localVideo();
    this.callObject.setLocalVideo(!videoReady);
  }

  toggleLocalAudio() {
    // Event is emitted from VideoTileComponent

    // Confirm they're in the call before updating media
    if (!this.joined || !this.callObject) return;

    // Toggle current audio state
    const audioReady = this.callObject.localAudio();
    this.callObject.setLocalAudio(!audioReady);
  }
}
