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

  // If there's a video track or audio track on init and it's ready to play, create a MediaStream for it.
  ngOnInit(): void {
    if (this.videoTrack && this.videoReady) {
      this.addVideoStream(this.videoTrack);
    }
    if (this.audioTrack && this.audioReady) {
      this.addAudioStream(this.audioTrack);
    }
  }

  /**
   * Changes that require updates include:
   * - Creating a video stream for the first time (either the track didn't exist on init or wasn't ready to play)
   * - Creating a audio stream for the first time (either the track didn't exist on init or wasn't ready to play)
   * - Replacing the video *track* for an existing video stream
   * - Replacing the audio *track* for an existing audio stream
   */
  ngOnChanges(changes: SimpleChanges): void {
    // Note: Only the props that have changed are included in changes.
    // If it's not included, we need to use existing version of the prop (e.g. this.videoTrack)
    const { videoReady, audioReady, videoTrack, audioTrack } = changes;

    // If the video is now ready or the track changed, and the stream hasn't been created, create it.
    if (videoReady?.currentValue && !this.videoStream && this.videoTrack) {
      // Use the existing prop since the track hasn't changed.
      this.addVideoStream(this.videoTrack);
    } else if (!this.videoStream && videoTrack?.currentValue) {
      // Use the new track and create a stream for it.
      this.addVideoStream(videoTrack.currentValue);
    }

    // If the audio is now ready or the track changed, and the stream hasn't been created, create it.
    if (audioReady?.currentValue && !this.audioStream && this.audioTrack) {
      // Use the existing prop since the track hasn't changed.
      this.addAudioStream(this.audioTrack);
    } else if (!this.audioStream && audioTrack?.currentValue) {
      // Use the new track and create a stream for it.
      this.addAudioStream(audioTrack.currentValue);
    }

    // If the video stream exists and a track change occurred, replace the track only.
    if (this.videoStream && videoTrack?.currentValue) {
      this.updateVideoTrack(videoTrack.previousValue, videoTrack.currentValue);
    }
    // If the audio stream exists and a track change occurred, replace the track only.
    if (this.audioStream && audioTrack?.currentValue) {
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
    if (oldTrack) {
      this.videoStream?.removeTrack(oldTrack);
    }
    this.videoStream?.addTrack(track);
  }

  updateAudioTrack(oldTrack: MediaStreamTrack, track: MediaStreamTrack) {
    if (oldTrack) {
      this.audioStream?.removeTrack(oldTrack);
    }
    this.audioStream?.addTrack(track);
  }

  toggleVideo(): void {
    this.toggleVideoClick.emit();
  }

  toggleAudio(): void {
    this.toggleAudioClick.emit();
  }

  handleLeaveCallClick(): void {
    this.leaveCallClick.emit();
  }
}
