import { useEffect, useRef } from "react";
import "./App.css";
import { AxisGizmoPlugin, DxfViewer, ViewerEvent } from "@pattern-x/gemini-viewer-threejs";

function App() {
  const containerRef = useRef(null);

  const filename = "rac_basic_sample_project";
  const modelCfg = {
    modelId: filename,
    name: filename,
    src: `/public/model/${filename}.dxf`,
    merge: true,
  };
  console.log(modelCfg.src);

  useEffect(() => {
    const viewerCfg = {
      containerId: "myCanvas",
      enableSpinner: true,
      enableProgressBar: true,
      enableLayoutBar: true,
    };

    const viewer = new DxfViewer(viewerCfg);
    console.log(viewer);
    window.viewer = viewer;
    new AxisGizmoPlugin(viewer, { ignoreZAxis: true });

    //
    const handle = async () => {
      const fontFiles = ["../public/font/hztxt.shx", "../public/font/simplex.shx"];
      await viewer.setFont(fontFiles);
      await viewer.loadModelAsync(modelCfg, (event) => {
        const progress = (event.loaded * 100) / event.total;
        console.log(`${event.type}: ${progress}%`);
      });
      console.log(`[Demo] Loaded model ${modelCfg.src}`);
    };
    handle();
    const getMarkupDataBtn = document.getElementById("GetMarkupData");
    const setMarkupDataBtn = document.getElementById("SetMarkupData");
    const updateMarkupDataBtn = document.getElementById("UpdateMarkupData");
    const removeMarkupDataBtn = document.getElementById("RemoveMarkupData");
    const markupDataTxt = document.getElementById("MarkupData");
    getMarkupDataBtn.onclick = () => {
      const markups = window.viewer.getMarkups();
      console.log(markups);
      // format the data a bit, so it looks better
      let val = "[";
      for (let i = 0; i < markups.length; ++i) {
        val += i > 0 ? ",\n" : "\n";
        val += JSON.stringify(markups[i]);
      }
      val += "\n]";
      markupDataTxt.value = val;
      console.log(val);
    };
    setMarkupDataBtn.onclick = () => {
      try {
        const markups = JSON.parse(markupDataTxt.value);
        console.log(markups);
        window.viewer.setMarkups(markups);
      } catch (ex) {
        console.warn(ex);
      }
    };
    updateMarkupDataBtn.onclick = () => {
      try {
        const markups = JSON.parse(markupDataTxt.value);
        console.log(markups);
        // update markups one by one
        for (let i = 0; i < markups.length; ++i) {
          const ret = window.viewer.updateMarkup(markups[i]);
          const str = `[Demo] ${ret ? "Updated" : "Failed to update"} markup with id: ${markups[i].id}`;
          console.log(str);
        }
      } catch (ex) {
        console.warn(ex);
      }
    };
    removeMarkupDataBtn.onclick = () => {
      try {
        const markups = JSON.parse(markupDataTxt.value);
        console.log(markups);
        // remove markups one by one
        for (let i = 0; i < markups.length; ++i) {
          const ret = window.viewer.removeMarkup(markups[i].id);
          const str = `[Demo] ${ret ? "Removed" : "Failed to remove"} markup with id: ${markups[i].id}`;
          console.log(str);
        }
      } catch (ex) {
        console.warn(ex);
      }
    };

    registerClickEvent("ArrowMarkup");
    registerClickEvent("CloudRectWithTextMarkup");
    registerClickEvent("RectMarkup");
    registerClickEvent("CircleMarkup");
    registerClickEvent("DotMarkup");
    registerClickEvent("ClearMarkups");
    registerClickEvent("ManageMarkups");
    // return () => {
    //   null;
    // };
    window.viewer.addEventListener(ViewerEvent.MarkupClicked, (data) => {
      if (data.markup) {
        console.log("[Demo] Clicked on markup:", data);
      }
    });
  }, []);

  const onProgress = (event) => {
    const progress = ((event.loaded * 100) / event.total).toFixed(1);
    console.log(`[Demo] Loading progress: ${progress}%`);
  };

  // const onProgress = (event) => {
  //   if (event && event.loaded && event.total) {
  //     const progress = ((event.loaded * 100) / event.total).toFixed(1);
  //     console.log(`[Demo] Loading progress: ${progress}%`);
  //   }
  // };

  const markupButtonClicked = (markupType, btn) => {
    if (markupType === "ManageMarkups") {
      const mgr = document.getElementsByClassName("markup-manager")[0];
      if (mgr.classList.contains("hide")) {
        mgr.classList.remove("hide");
        btn.classList.add("btn-active");
      } else {
        mgr.classList.add("hide");
        btn.classList.remove("btn-active");
      }
      return;
    }
    // deactive current markup
    const activeMarkupType = window.viewer.getActiveMarkupType();
    if (activeMarkupType) {
      let activeBtn = document.getElementById(activeMarkupType);
      activeBtn.classList.remove("btn-active");
      window.viewer.deactivateMarkup(activeMarkupType);
    }
    if (markupType === "ClearMarkups") {
      window.viewer.clearMarkups();
      return;
    }
    // active new markup if a different type is clicked
    if (activeMarkupType !== markupType) {
      btn.classList.add("btn-active");
      window.viewer.activateMarkup(markupType);
    }
  };

  const registerClickEvent = (markupType) => {
    let btn = document.getElementById(markupType);
    btn.onclick = () => markupButtonClicked(markupType, btn);
  };

  return (
    <>
      <div id="app">
        <div id="myCanvas" className="container" ref={containerRef}></div>
        <div className="markup-toolbar">
          <button id="ArrowMarkup" className="markup-toolbar-btn">
            Arrow
          </button>
          <button id="CloudRectWithTextMarkup" className="markup-toolbar-btn">
            CloudRect
          </button>
          <button id="RectMarkup" className="markup-toolbar-btn">
            Rect
          </button>
          <button id="CircleMarkup" className="markup-toolbar-btn">
            Circle
          </button>
          <button id="DotMarkup" className="markup-toolbar-btn">
            Dot
          </button>
          <button id="ClearMarkups" className="markup-toolbar-btn" title="Clear all markups">
            Clear
          </button>
          <button id="ManageMarkups" className="markup-toolbar-btn" title="View and manage markup data">
            View data
          </button>
        </div>
        <div className="markup-manager hide">
          <textarea id="MarkupData" className="markup-manager-text"></textarea>
          <div className="markup-manager-bottom">
            <button id="GetMarkupData" className="markup-toolbar-btn" title="Get all markups">
              Get
            </button>
            <button id="SetMarkupData" className="markup-toolbar-btn" title="Reset markups">
              Set
            </button>
            <button id="UpdateMarkupData" className="markup-toolbar-btn" title="Update one or more markups">
              Update
            </button>
            <button id="RemoveMarkupData" className="markup-toolbar-btn" title="Remove one or more markups">
              Remove
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
