**EasyVideoTrim**
A simple browser-based video trimming and editing system.


**Installation & Running**

Clone the project:

git clone https://github.com/sagibarshai/video-editor-app.git


cd video-editor-app

Install project dependencies:ֿ

npm install


Run the development server:

npm run dev

Navigate to http://localhost:5173 in your browser.


Note: Make sure port 5173 is available on your machine before starting the project.

**Key Features:**

Video Playback - Play and pause videos directly in the browser
Video Trimming - Select start and end points for trimming
Preview - Watch a preview of the selected segment before saving
Thumbnails - View thumbnails across the video timeline for easy navigation




**Component Overview:**

VideoPlayer: The main container component that manages video state and integrates all sub-components
VideoActionsButtons: Controls for play, pause, and volume adjustment
VideoTimeline: Visual timeline for scrubbing through the video
VideoTrimBar: Interface for selecting trim points with thumbnail previews

Implementation Details
The video player uses React's useRef and useState hooks to manage the video element and its state. Event listeners are attached to the video element to track playback status, loading state, and current time.
Key implementation features:

Event handling via addEventListener to prevent event handler conflicts
Custom thumbnail generation for the trim interface
Preview functionality to watch selected segments before saving
Real-time display of trim start/end times and total duration

**Technologies**

React + TypeScript
Vite
HTML5 Video API
