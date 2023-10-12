import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from "@angular/core";

@Component({
  selector: "video-tile",
  templateUrl: "./video-tile.component.html",
  styleUrls: ["./video-tile.component.css"],
})
export class VideoTileComponent {
  @Input() joined: boolean;
  // @Input() participant: Participant;
  @Input() videoReady: boolean;
  @Input() audioReady: boolean;
  @Input() local: boolean;
  @Input() userName: string;
  @Input() videoTrack: MediaStreamTrack | undefined;
  @Input() audioTrack: MediaStreamTrack | undefined;
  videoStream: MediaStream | undefined;
  audioStream: MediaStream | undefined;

  @Output() leaveCallClick: EventEmitter<null> = new EventEmitter();
  @Output() toggleVideoClick: EventEmitter<null> = new EventEmitter();
  @Output() toggleAudioClick: EventEmitter<null> = new EventEmitter();

  // If there's a video track or audio track on init, create a MediaStream for it.
  ngOnInit(): void {
    if (this.videoTrack) {
      this.addVideoStream(this.videoTrack);
    }
    if (this.audioTrack) {
      this.addAudioStream(this.audioTrack);
    }
  }

  /**
   * Changes that require updates include:
   * - Creating a video stream for the first time
   * - Creating a audio stream for the first time
   * - Replacing the video *track* for an existing video stream
   * - Replacing the audio *track* for an existing audio stream
   */
  ngOnChanges(changes: SimpleChanges): void {
    // Note: Only the props that have changed are included in changes.
    // If it's not included, we need to use existing version of the prop (e.g. this.videoTrack)
    const { videoTrack, audioTrack } = changes;

    // If the video stream hasn't been created and the track can be set, create a new stream.
    if (videoTrack?.currentValue && !this.videoStream) {
      // Use the new track and create a stream for it.
      this.addVideoStream(videoTrack.currentValue);
    }

    // If the video stream hasn't been created and the track can be set, create a new stream.
    if (audioTrack?.currentValue && !this.audioStream) {
      // Use the new track and create a stream for it.
      this.addAudioStream(audioTrack.currentValue);
    }

    // If the video stream exists and a track change occurred, replace the track only.
    if (videoTrack?.currentValue && this.videoStream) {
      this.updateVideoTrack(videoTrack.previousValue, videoTrack.currentValue);
    }

    // If the audio stream exists and a track change occurred, replace the track only.
    if (audioTrack?.currentValue && this.audioStream) {
      this.updateAudioTrack(audioTrack.previousValue, audioTrack.currentValue);
    }
  }

  addVideoStream(track: MediaStreamTrack) {
    this.videoStream = new MediaStream([track]);
  }

  addAudioStream(track: MediaStreamTrack) {
    this.audioStream = new MediaStream([track]);
  }

  updateVideoTrack(oldTrack: MediaStreamTrack, track: MediaStreamTrack) {
    // This should be true since it's a track change, but check just in case.
    if (oldTrack) {
      this.videoStream?.removeTrack(oldTrack);
    }
    this.videoStream?.addTrack(track);
  }

  updateAudioTrack(oldTrack: MediaStreamTrack, track: MediaStreamTrack) {
    // This should be true since it's a track change, but check just in case.
    if (oldTrack) {
      this.audioStream?.removeTrack(oldTrack);
    }
    this.audioStream?.addTrack(track);
  }

  handleToggleVideoClick(): void {
    this.toggleVideoClick.emit();
  }

  handleToggleAudioClick(): void {
    this.toggleAudioClick.emit();
  }

  handleLeaveCallClick(): void {
    this.leaveCallClick.emit();
  }
}
