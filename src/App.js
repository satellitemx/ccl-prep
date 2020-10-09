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

const BookmarkedOnlyCheckbox = ({ bookmarkedOnly, toggleBookmarkedOnly }) => {
    return (
        <label className="checkbox">
            仅查看已收藏
            <input
                className={bookmarkedOnly ? "checked" : ""}
                type="checkbox"
                checked={bookmarkedOnly}
                onChange={toggleBookmarkedOnly}
                name="bookmark" />
            <span className="checkmark" ></span>
        </label>
    )
}

const Workspace = ({ expanded, collapseHero }) => {
    const [vocabCate, _setVocabCate] = useState("medical")
    const [vocabStore, _setVocabStore] = useState({})
    const [vocabIndex, _setVocabIndex] = useState(0)
    const [bookmarkedOnly, setBookmarkedOnly] = useState(false)
    const [bookmarkedStore, setBookmarkedStore] = useState({})

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

    const bookmarkCurrentWord = () => {
        if (bookmarkedOnly) return
        if (bookmarkedStore[vocabCate].indexOf(vocabIndex) === -1) {
            setBookmarkedStore({
                ...bookmarkedStore,
                [vocabCate]: [...bookmarkedStore[vocabCate], vocabIndex]
            })
            console.log(bookmarkedStore)
            recordBookmark()
        }
    }

    const handleVocabCateChange = (e) => {
        const newCate = e.target.value
        if (!localStorage.getItem(newCate)) {
            setVocabIndex(0)
            localStorage.setItem(newCate, 0)
            recordProgress()
        }
        setVocabCate(newCate)
        if (bookmarkedOnly) {
            setVocabIndex(0)
        } else {
            setVocabIndex(parseInt(localStorage.getItem(newCate)))
        }
        recordProgress()
        collapseHero()
    }

    const nextWord = () => {
        if (vocabIndexRef.current < displayedWords.length - 1) {
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
        if (bookmarkedOnly) return
        localStorage.setItem("current", JSON.stringify({
            category: vocabCateRef.current,
            index: vocabIndexRef.current
        }))
        localStorage.setItem(vocabCateRef.current, vocabIndexRef.current)
    }

    const toggleBookmarkedOnly = () => {
        if (bookmarkedOnly) {
            setVocabIndex(parseInt(localStorage.getItem(vocabCate)))
        } else {
            setVocabIndex(0)
        }
        setBookmarkedOnly(!bookmarkedOnly)
    }

    const recordBookmark = () => {
        if (bookmarkedOnly) return
        localStorage.setItem("bookmarked", JSON.stringify(bookmarkedStore))
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
        const currentBookmarkedStore = localStorage.getItem("bookmarked")
        if (currentProgress) {
            const parsed = JSON.parse(currentProgress)
            setVocabCate(parsed.category)
            setVocabIndex(parsed.index)
        } else {
            recordProgress()
        }
        if (currentBookmarkedStore) {
            const parsed = JSON.parse(currentBookmarkedStore)
            setBookmarkedStore(parsed)
        } else {
            setBookmarkedStore(Object.keys(vocabStore).reduce((cum, cur) => {
                return {
                    ...cum,
                    [cur]: []
                }
            }, {}))
        }
    }, [vocabStore])

    let displayedWords = bookmarkedOnly
        ? bookmarkedStore[vocabCate].map(index => vocabStore[vocabCate][index])
        : vocabStore[vocabCate] ? vocabStore[vocabCate].map(word => word) : []

    if (displayedWords.length === 0) {
        displayedWords.push("None")
    }

    return (
        <div className={`workspace ${expanded && "expanded"}`}>
            <div className="workspace-status">
                <p>
                    选择词库 👉
                    <SelectVocabCate vocabCate={vocabCate} handleVocabCateChange={handleVocabCateChange} />
                    <BookmarkedOnlyCheckbox bookmarkedOnly={bookmarkedOnly} toggleBookmarkedOnly={toggleBookmarkedOnly} />
                </p>
            </div>
            <div className="workspace-word">
                <p onClick={bookmarkCurrentWord}>
                    {displayedWords[vocabIndex]}
                </p>
            </div>
            <div className="workspace-control">
                <div onClick={prevWord} className="control control-left"></div><p>{vocabIndex + 1} / {displayedWords.length}</p>
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