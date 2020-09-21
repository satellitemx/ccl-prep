import React, { useState, useEffect, useRef } from "react"
import getVocab from "./services/vocab"

const Hero = ({ collapsed, collapseHero }) => {
    return (
        <div className={`hero ${collapsed && "collapsed"}`}>
            <div className="hero-description">
                <p className="hero-em">免费在线</p>
                <p className="hero-title">CCL VOCAB PRACTICE</p>
                <p>时间宝贵，本服务无需注册。点击下方按钮即可开始练习。</p>
                <p><button onClick={collapseHero} className="button">立刻开始 👇</button></p>
            </div>
            <div className="hero-image"></div>
        </div>
    )
}

const SelectVocabCate = ({ vocabCate, handleVocabCateChange }) => {

    const bookmarked = localStorage.getItem("bookmarked") && localStorage.getItem("bookmarked").length > 0

    return (
        <select className="button" name="vocab" value={vocabCate} onChange={handleVocabCateChange}>
            <option value="medical">医疗</option>
            <option value="legal">法律</option>
            <option value="education">教育</option>
            <option value="immigration">移民</option>
            <option value="welfare">Centrelink/社区服务</option>
            <option value="business">商业/金融/保险</option>
        </select>
    )
}

const BookmarkedCheckbox = ({ bookmarked, toggleBookmarked }) => {
    return (
        <label className="checkbox">
            仅查看已收藏
            
            <input className={bookmarked && "checked"} type="checkbox" checked={bookmarked} onChange={toggleBookmarked} name="bookmark" />
            <span className="checkmark" ></span>
        </label>
    )
}

const Workspace = ({ expanded, collapseHero }) => {
    const [vocabCate, _setVocabCate] = useState("medical")
    const [vocabStore, _setVocabStore] = useState({})
    const [vocabIndex, _setVocabIndex] = useState(0)
    const [bookmarked, setBookmarked] = useState(false)

    const vocabCateRef = useRef(vocabCate)
    const vocabStoreRef = useRef(vocabStore)
    const vocabIndexRef = useRef(vocabIndex)

    const autoRefSetter = (ref, origSetter) => data => {
        ref.current = data
        origSetter(data)
    }

    const setVocabCate = autoRefSetter(vocabCateRef, _setVocabCate)
    const setVocabStore = autoRefSetter(vocabStoreRef, _setVocabStore)
    const setVocabIndex = autoRefSetter(vocabIndexRef, _setVocabIndex)

    const selectCurrentWord = (e) => {
        console.log(e.target)
        // e.target.select()
    }

    const handleVocabCateChange = (e) => {
        const newCate = e.target.value
        if (!localStorage.getItem(newCate)) {
            setVocabIndex(0)
            localStorage.setItem(newCate, 0)
            recordProgress()
        }
        setVocabCate(newCate)
        setVocabIndex(Number(localStorage.getItem(newCate)))
        recordProgress()
        collapseHero()
    }

    const toggleBookmarked = (e) => {
        setBookmarked(e.target.checked)
    }

    const nextWord = () => {
        if (vocabIndexRef.current < vocabStoreRef.current[vocabCateRef.current].length - 1) {
            setVocabIndex(vocabIndexRef.current + 1)
        }
        recordProgress()
    }

    const prevWord = () => {
        if (vocabIndexRef.current > 0) {
            setVocabIndex(vocabIndexRef.current - 1)
        }
        recordProgress()
    }

    const recordProgress = () => {
        localStorage.setItem("current", JSON.stringify({
            category: vocabCateRef.current,
            index: vocabIndexRef.current
        }))
        localStorage.setItem(vocabCateRef.current, vocabIndexRef.current)
    }

    const keySwitcher = (e) => {
        switch (e.keyCode) {
            case 37:
                prevWord()
                break
            case 39:
                nextWord()
                break
            default:
                return
        }
    }

    useEffect(() => {
        window.addEventListener("keydown", keySwitcher)
        getVocab().then(data => {
            setVocabStore(data)
        })
    }, [])

    useEffect(() => {
        const currentProgress = localStorage.getItem("current")
        if (currentProgress) {
            const parsed = JSON.parse(currentProgress)
            setVocabCate(parsed.category)
            setVocabIndex(parsed.index)
        } else {
            recordProgress()
        }
    }, [vocabStore])

    return (
        <div className={`workspace ${expanded && "expanded"}`}>
            <div className="workspace-status">
                <p>
                    选择词库 👉 
                    <SelectVocabCate vocabCate={vocabCate} handleVocabCateChange={handleVocabCateChange} />
                    {/* <BookmarkedCheckbox bookmarked={bookmarked} toggleBookmarked={toggleBookmarked} /> */}
                </p>
            </div>
            <div className="workspace-word">
                <p onClick={selectCurrentWord}>{vocabStore[vocabCate] && vocabStore[vocabCate][vocabIndex]}</p>
            </div>
            <div className="workspace-control">
                <div onClick={prevWord} className="control control-left"></div><p>{vocabIndex + 1} / {vocabStore[vocabCate] && vocabStore[vocabCate].length}</p>
                <div onClick={nextWord} className="control control-right"></div>
            </div>
        </div >
    )
}

const App = () => {
    const [heroCollapsed, setHeroCollapsed] = useState(false)

    const collapseHero = () => {
        setHeroCollapsed(true)
    }

    return (
        <>
            <Hero collapsed={heroCollapsed} collapseHero={collapseHero} />
            <Workspace expanded={heroCollapsed} collapseHero={collapseHero} />
        </>
    )
}

export default App