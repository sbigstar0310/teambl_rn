import React from "react";
import "../../styles/SearchLoading.css";

const SearchProjectLoading = () => {
  return (
    <div className="searchloading-body">
      <div className="searchloading-title">게시글을 검색중입니다.</div>
      <div className="searchloading-text">조금만 기다려주세요.</div>
    </div>
  );
};

export default SearchProjectLoading;
