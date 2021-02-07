import React, { useEffect, useState } from "react";
import axios from "axios";
import "./app.less";
const MODAL_WIDTH = 350;

/**
 * 边界检测，鼠标点击modal之外，modal隐藏
 * @param {*} x 鼠标的x轴位置
 * @param {*} y 鼠标的y轴位置
 * @param {*} modalPosition 弹窗的left和top
 */
function boundaryDetection(x, y, modalPosition = { left: 0, top: 0 }) {
  let { left, top } = modalPosition;
  if (
    x > left &&
    x < left + MODAL_WIDTH &&
    y > top &&
    y < top + MoveSearchApp.offsetHeight
  ) {
    return true;
  }
  return false;
}

const App = () => {
  const [show, setShow] = useState(false);

  const [data, setData] = useState([]);
  const [text, setText] = useState("");
  const [position, setPosition] = useState({ left: 0, top: 0 });

  const fun = (e) => {
    console.log("e: ", e);
    const selectionObj = window.getSelection();
    const selectText = selectionObj.toString();

    if (selectText) {
      const selectionObjRect = selectionObj
        .getRangeAt(0)
        .getBoundingClientRect();
      // 获取文字的位置，xy为横纵坐标，height width是选中文字的高度和宽度
      let { x, y, width, height } = selectionObjRect;
      const left = Math.max(x + width / 2 - MODAL_WIDTH / 2, 10);
      const top = y + height;

      var scrollLeft =
        document.documentElement.scrollLeft || document.body.scrollLeft;
      var scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;
      axios
        .get(
          `https://movesearch.vercel.app/api/baidu?query=${selectText}&pageNum=1&pageSize=10`
        )
        .then((res) => {
          let { data } = res.data.data.documents;
          if (data.length) {
            setData(data);
            setShow(true);
            setText(selectText);
            setPosition({
              left: left + scrollLeft,
              top: top + scrollTop,
            });
          }
        });
    } else {
      if (show) {
        // 重新计算是否关闭弹窗
        // 检测鼠标位置是否在弹窗内，不是则关闭弹窗
        var inModal = boundaryDetection(e.clientX, e.clientY, position);
        console.log(
          "e.clientX, e.clientY, position: ",
          e.clientX,
          e.clientY,
          position
        );
        if (!inModal) {
          setShow(false);
          setData([]);
        }
      }
    }
  };
  useEffect(() => {
    document.addEventListener("mouseup", fun);
    return window.removeEventListener("mouseup", fun);
  }, [show]);
  return (
    <>
      {show && data.length && (
        <div
          className="move-search"
          id="MoveSearchApp"
          style={{
            ...position,
          }}
        >
          <div className="move-search-content">
            <ul className="move-search-ul">
              {data.map((l) => (
                <li className="move-search-li" key={l.id}>
                  <a href={l.url} target="_blank">
                    {l.title}
                  </a>
                  <span>{l.summary}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="move-search-bottom-fade"></div>
          <footer className="move-search-footer">
            <a
              href={`https://kaifa.baidu.com/searchPage?wd=${text}`}
              target="_blank"
            >
              Read More
            </a>
          </footer>
        </div>
      )}
    </>
  );
};
export default App;
