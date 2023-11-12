import { useState } from "react";
import Router from "next/router";
const { MemoryCache, RLN, Status } = require("rlnjs");
const ethers = require("ethers");

import HeadMetadata from "../components/headMetadata.js";
import AlternateHeader from "../components/alternateHeader.js";

import authUser from "../apix/users/authUser.js";
import submitNewItem from "../apix/items/submitNewItem.js";

export default function Submit({}) {
    const [loading, setLoading] = useState(false);
    const [titleInputValue, setTitleInputValue] = useState("");
    const [urlInputValue, setUrlInputValue] = useState("");
    const [textInputValue, setTextInputValue] = useState("");

    const [error, setError] = useState({
        titleRequiredError: false,
        titleTooLongError: false,
        invalidUrlError: false,
        urlAndTextError: false,
        textTooLongError: false,
        submitError: false,
    });

    const updateTitleInputValue = (event) => {
        setTitleInputValue(event.target.value);
    };

    const updateUrlInputValue = (event) => {
        setUrlInputValue(event.target.value);
    };

    const updateTextInputValue = (event) => {
        setTextInputValue(event.target.value);
    };

    const submitRequest = async() => {
        const rlnIdentifier = BigInt(5568)
        const messageLimit = BigInt(1);
        const epoch = BigInt(2337)
        const signerTestERC20Amount = BigInt(100000000)
        const slasher = "0x0000000000000000000000000000000000009876"
    
        const rlnContractArgs = {
            minimalDeposit: BigInt(100),
            treeDepth: treeDepth,
            feePercentage: BigInt(10),
            feeReceiver: "0x0000000000000000000000000000000000006789",
            freezePeriod: BigInt(1),
        }
        console.log(`Connecting to endpoint at ${rlnurl}`)
        const provider = new ethers.JsonRpcProvider(rlnurl)
        const signer = await provider.getSigner(authUser.address);

        const rlnContractAddress = "0xE831a22E1b09D2F25dae664BAe2EA45F8e257dd0"
        const rlnContractAtBlock = await provider.getBlockNumber()
        console.log(`Deployed RLN contract at ${rlnContractAddress} at block ${rlnContractAtBlock}`)
    
        async function createRLNInstance() {
            return await RLN.createWithContractRegistry({
                /* Required */
                rlnIdentifier,
                provider,
                contractAddress: rlnContractAddress,
                /* Optional */
                contractAtBlock: rlnContractAtBlock,
                signer,
            })
        }
    
        async function mineBlocks(numBlocks) {
            provider.send("hardhat_mine", ["0x" + numBlocks.toString(16)])
        }
        // class ResettableCache extends MemoryCache {
        //     async reset() {
        //         this.cache = {}
        //     }
        // }
        // const resettableCache = new ResettableCache()
        const rln = await createRLNInstance()
        // rln.setCache(resettableCache)

        console.log(`rln created: identityCommitment=${rln.identityCommitment}`)
        if (await rln.isRegistered()) {
            throw new Error(`rln should not have yet registered`);
        }
        console.log(`Try with rate limit ${messageLimit}...`)
    
        // /* Register */
      
        await rln.register(messageLimit);
        if (!await rln.isRegistered()) {
            throw new Error(`Failed to register`);
        }
        console.log(`Successfully registered`);
    
        /* Create Proof */
        console.log(`Creating proof...`)
        let hashed_message = hashTitleAndContent(title, text, url);
       
        const proof = await rln.createProof(epoch, hashed_message);
        if (loading) return;

        if (!titleInputValue.trim()) {
            setError({
                titleRequiredError: true,
                titleTooLongError: false,
                invalidUrlError: false,
                urlAndTextError: false,
                textTooLongError: false,
                submitError: false,
                proofError: false,
            });
        } else if (titleInputValue.length > 80) {
            setError({
                titleRequiredError: false,
                titleTooLongError: true,
                invalidUrlError: false,
                urlAndTextError: false,
                textTooLongError: false,
                submitError: false,
                proofError: false,
            });
        } else if (urlInputValue && textInputValue) {
            setError({
                titleRequiredError: false,
                titleTooLongError: false,
                invalidUrlError: false,
                urlAndTextError: true,
                textTooLongError: false,
                submitError: false,
                proofError: false,
            });
        } else if (textInputValue.length > 5000) {
            setError({
                titleRequiredError: false,
                titleTooLongError: false,
                invalidUrlError: false,
                urlAndTextError: false,
                textTooLongError: true,
                submitError: false,
                proofError: false,
            });
        } else {
            setLoading(true);

            submitNewItem(titleInputValue, urlInputValue, textInputValue, proofInputValue, (response) => {
                setLoading(false);

                if (response.authError) {
                    // location.href = "/login?goto=submit";
                    Router.push("/login?goto=submit");
                } else if (response.titleRequiredError) {
                    setError({
                        titleRequiredError: true,
                        titleTooLongError: false,
                        invalidUrlError: false,
                        urlAndTextError: false,
                        textTooLongError: false,
                        submitError: false,
                        proofError:false
                    });
                } else if (response.urlAndTextError) {
                    setError({
                        titleRequiredError: false,
                        titleTooLongError: false,
                        invalidUrlError: false,
                        urlAndTextError: true,
                        textTooLongError: false,
                        submitError: false,
                        proofError:false
                    });
                } else if (response.invalidUrlError) {
                    setError({
                        titleRequiredError: false,
                        titleTooLongError: false,
                        invalidUrlError: true,
                        urlAndTextError: false,
                        textTooLongError: false,
                        submitError: false,
                        proofError:false
                    });
                } else if (response.titleTooLongError) {
                    setError({
                        titleRequiredError: false,
                        titleTooLongError: true,
                        invalidUrlError: false,
                        urlAndTextError: false,
                        textTooLongError: false,
                        submitError: false,
                        proofError:false
                    });
                } else if (response.textTooLongError) {
                    setError({
                        titleRequiredError: false,
                        titleTooLongError: false,
                        invalidUrlError: false,
                        urlAndTextError: false,
                        textTooLongError: true,
                        submitError: false,
                    });
                } else if (response.submitError || !response.success) {
                    setError({
                        titleRequiredError: false,
                        titleTooLongError: false,
                        invalidUrlError: false,
                        urlAndTextError: false,
                        textTooLongError: false,
                        submitError: true,
                        proofError:false
                    });
                } else {
                    // location.href = "/newest";
                    Router.push("/newest");
                }
            });
        }
    };

    return (
        <div className="layout-wrapper">
            <HeadMetadata title="Submit | ZKHackerNews" />
            <AlternateHeader displayMessage="Submit" />
            <div className="submit-content-container">
                {error.titleRequiredError ? (
                    <div className="submit-content-error-msg">
                        <span>Title is required.</span>
                    </div>
                ) : null}
                {error.titleTooLongError ? (
                    <div className="submit-content-error-msg">
                        <span>Title exceeds limit of 80 characters.</span>
                    </div>
                ) : null}
                {error.invalidUrlError ? (
                    <div className="submit-content-error-msg">
                        <span>URL is invalid.</span>
                    </div>
                ) : null}
                {error.urlAndTextError ? (
                    <div className="submit-content-error-msg">
                        <span>
                            Submissions can’t have both urls and text, so you need to pick one. If you keep the url, you
                            can always post your text as a comment in the thread.
                        </span>
                    </div>
                ) : null}
                {error.textTooLongError ? (
                    <div className="submit-content-error-msg">
                        <span>Text exceeds limit of 5,000 characters.</span>
                    </div>
                ) : null}
                {error.submitError ? (
                    <div className="submit-content-error-msg">
                        <span>An error occurred.</span>
                    </div>
                ) : null}

                {/* TITLE FIELD */}
                <div className="submit-content-input-item title">
                    <div className="submit-content-input-item-label">
                        <span>title</span>
                    </div>
                    <div className="submit-content-input-item-input">
                        <input type="text" value={titleInputValue} onChange={updateTitleInputValue} />
                    </div>
                </div>

                {/* URL FIELD */}
                <div className="submit-content-input-item url">
                    <div className="submit-content-input-item-label">
                        <span>url</span>
                    </div>
                    <div className="submit-content-input-item-input">
                        <input type="text" value={urlInputValue} onChange={updateUrlInputValue} />
                    </div>
                </div>

                <div className="submit-content-input-or-divider">
                    <span>or</span>
                </div>

                {/* TEXT FIELD */}
                <div className="submit-content-text-input-item">
                    <div className="submit-content-text-input-item-label">
                        <span>text</span>
                    </div>
                    <div className="submit-content-text-input-item-input">
                        <textarea type="text" value={textInputValue} onChange={updateTextInputValue} />
                    </div>
                </div>

                {/* SUBMIT BTN */}
                <div className="submit-content-input-btn">
                    <input type="submit" value="submit" onClick={() => submitRequest()} />
                    {loading && <span> loading...</span>}
                </div>
                <div className="submit-content-bottom-instructions">
                    <span>
                        Leave url blank to submit a question for discussion. If there is no url, the text (if any) will
                        appear at the top of the thread.
                    </span>
                </div>
            </div>
        </div>
    );
}

export async function getServerSideProps({ req, res, query }) {
    const authResult = await authUser(req);

    if (!authResult.success) {
        return {
            redirect: {
                destination: "/login?goto=submit",
                permanent: false,
            },
        };
    }

    return {
        props: {},
    };
}
