<script>
  import {listen as tauriListen} from '@tauri-apps/api/event';
  import api_call from "@/lib/utils/api_call";

  const allowedFileExtensions = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'bmp': 'image/bmp',
    'tif': 'image/tiff',
    'tiff': 'image/tiff',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'gif': 'image/gif',
    'ico': 'image/x-icon',
  };

  function basenameFromPath(str) {
    const sep = str.match(/\\/) ? '\\' : '/';
    let base = String(str).substring(str.lastIndexOf(sep) + 1);
    if(base.lastIndexOf(".") !== -1) {
      base = base.substring(0, base.lastIndexOf("."));
    }
    return base;
  }

  export default {
    /**
     * This function is executed when Vue mounts the DragDrop component in the DOM.
     * We store listeners in an array in memory so we can "unlisten" when the
     *   component is unmounted from the DOM.
     * This avoids executing the same callback multiple times when component is unmounted
     *   and re-mounted.
     */
    async mounted() {
      this.tauriListeners.push(await tauriListen('tauri://file-drop', this.dropFile));
      this.tauriListeners.push(await tauriListen('tauri://file-drop-hover', this.dropHover));
      this.tauriListeners.push(await tauriListen('tauri://file-drop-cancelled', this.dropCancel));
    },

    /**
     * When component is unmounted from the DOM, we just delete the different listeners.
     */
    unmounted() {
      this.tauriListeners.forEach((unlisten) => {
        console.info({unlisten});
        unlisten();
      });
      this.tauriListeners = [];
    },

    data() {
      return {
        tauriListeners: [],
        isDroppingFile: false,
        files: [],
      }
    },

    methods: {
      browse: function() {
        console.info(this);
        // Not yet implemented
      },

      /**
       * These events are triggered by Tauri when the user tries to
       *   drag a file from their OS and drop it inside the Tauri app.
       */
      dropHover: function () {this.isDroppingFile = true;},
      dropCancel: function () {this.isDroppingFile = false;},
      dropFile: function (event) {
        const _this = this;

        let alert_given = false;

        this.isDroppingFile = false;

        event.payload.forEach(async (filename) => {
          // Prevents calling "alert()" once per file.
          if (alert_given) { return; }

          const fileExtensionRegex = new RegExp(`.+\\.(${Object.keys(allowedFileExtensions).join('|')})$`, 'gi');
          const fileExt = filename.replace(fileExtensionRegex, '$1');

          if (!allowedFileExtensions[fileExt]) {
            alert(`Unsupported file ${filename}.\nAllowed extensions are the following:\n${Object.keys(allowedFileExtensions).join(', ')}`);
            alert_given = true;
            return;
          }

          /**
           * This function calls the application backend (built in Rust).
           * Check the "src-tauri/main.rs" file for more information
           *   about the "get_file_content" command.
           * TL;DR: it reads the file from disk and returns an array of
           *   numbers corresponding to the binary representation of the file.
           */
          api_call("get_file_content", {path: filename})
            .then((fileContent) => {
              const fileBinaryData = new Uint8Array(fileContent);
              const b64encoded = Buffer.from(fileBinaryData).toString('base64');

              //
              _this.files.push({
                filename: filename,
                name: basenameFromPath(filename)+'.'+fileExt,
                src: `data:${allowedFileExtensions[fileExt]};base64, ${b64encoded}`
              });
            })
            .catch((e) => {
              alert(`Error while reading file "${filename}":\n ${e}`);
              console.error(e);
            })
          ;
        });
      },
    }
  };
</script>

<template>
  <h1>Drag&drop test</h1>
  <div class="drag-area" v-bind:class="{ active: isDroppingFile }" @mouseenter="enterArea" @mouseover="enterArea" @mouseleave="leaveArea">

    <div class="icon"><i class="fas fa-cloud-upload-alt"></i></div>
    <header>Drag & Drop to Upload File</header>
    <span>OR</span>

    <button type="button" @click="browse">Browse File</button>

    <input type="file" hidden>

    <ul id="files-list">
      <li v-for="file in this.files" :key="file.filename">
        <img width="40" v-bind:src="file.src" v-bind:alt="file.filename">
        {{ file.name }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.drag-area {
  background-color: #25286d;
  border: 2px dashed #ddd;
  height: 500px;
  width: 500px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  font-family: "Calibri", sans-serif;
}

.drag-area.active {
  border-color: #e76666;
  opacity: 0.9;
}

.drag-area .icon {
  font-size: 100px;
  color: #fff;
}

.drag-area header {
  font-size: 30px;
  font-weight: 500;
  color: #fff;
}

.drag-area span {
  font-size: 25px;
  font-weight: 500;
  color: #fff;
  margin: 10px 0 15px 0;
}

.drag-area button {
  padding: 10px 25px;
  font-size: 20px;
  font-weight: 500;
  border: none;
  outline: none;
  background: #fff;
  color: #5256ad;
  border-radius: 5px;
  cursor: pointer;
}
.drag-area img {
  vertical-align: middle;
}
#files-list {
  margin-top: 10px;
  padding: 0 25px;
  list-style: none;
  color: #ddd;
}
</style>
