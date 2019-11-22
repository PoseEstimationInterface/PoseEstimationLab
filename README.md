Util Function
========================
## whereGround(pose)
### 기능 
ground의 위치를 계속해서 업데이트 해주는 함수
### Input
pose : 한 프레임의 포즈를 통째로 입력한다.
### Output
void
### 예시
<pre><code>
//전역변수
var ground = [0,0];
var groundVal = 0;
	//반복문 내부
	whereGround(poses[0]);
</pre></code>
> 함수를 작동하기 위해 ground 와 groundVal 이 꼭 필요하다.

## whatLen(point_1,point_2)
### 기능
두 점 사이의 거리를 리턴해주는 함수
### Input
point_1 : 시작 점 ( pose 데이터 중 'position' 값)
point_2 : 끝 점 ( pose 데이터 중 'position' 값)
### Output
두 점 사이의 거리(float)
### 예시
<pre><code>
var point_1 = pose[0]['keypoints'][10]['position'];
var point_2 = pose[0]['keypoints'][11]['position'];
var len = whatLen(point_1, point_2);
</pre></code>

## whatAngle(point_1,point_mid,point_2)
### 기능
세 점의 사이각을 리턴해주는 함수
### Input
point_1 : 시작 점
point_mid : 사이 점
point_2 : 끝 점

### Output
세 점의 사이각(float)
### 예시
<pre><code>
var  leftHip  =  pose['keypoints'][11]['position'];
var  leftShoulder  =  pose['keypoints'][5]['position']
var  leftElbow  =  pose['keypoints'][7]['position']

var  angle  =  whatAngle(leftElbow,leftShoulder,leftHip)
</pre></code>

## whatV(pointNum, threshold)
### 기능
한 점의 진행 벡터를 스칼라 값과 방향 벡터로
리턴하는 함수
### Input
pointNum : posenet Array 상에서 원하는 점의 번호
threshold : 민감도
### Output
array = [ len(float), x(float), y(float) ]

### 예시
<pre><code>
//전역변수
var  prePose  = [];
	//반복문 내부
	prePose.unshift(poses[0]);
	whatV(10,17);
	if(prePose.length  >  4)
	{
		whatV(10);
		prePose.pop();
	}
</pre></code>
> whatV 를 사용하기 위해선, prePose 라는 전역 array가 필요하고, 반복문이 시작되고 최소 4프레임이 지나야 사용 가능함. 추후 바로 가능하게 수정하겠음.

Pose Function
==========
> 포즈에 관련된 함수들.
> 인풋과, 아웃풋, 예시 가 대부분 비슷하기 때문에
> 첫 번째 함수 와 특수 케이스를 제외하곤 인풋과 아웃풋, 예시를 명시하지 않음.


## leftHandsupL(pose)
### 기능
왼손을 올렸는지에 대한 여부를 리턴하는 함수. leftHandsup의 Lite 버전.
### Input
pose : 포즈 한개를 통째로 입력
### Output
0 : 해당 행동을 하지 않음
1 : 해당 행동을 함
### 예시
<pre><code>
leftHandsupL(poses[0]);
</pre></code>
## rightHandsupL(pose)
### 기능
오른손을 올렸는지에 대한 여부를 리턴하는 함수. rightHandsup의 Lite 버전.
## sitDown(pose)
### 기능
앉아 있는지에 대한 여부를 리턴하는 함수. 
> 지금은 몸의 길이를 기반으로 이루어져 있으나, 추후 ground 기반으로 수정 될 예정.
## sangSang(pose)
### 기능
상상도 못한 정체 포즈를 했는지에 대한 여부를 리턴하는 함수.
## jumpWithGround(pose)
### 기능
ground를 기반으로 점프를 했는지에 대한 여부를 리턴하는 함수.
> 카메라가 기울어져 있을 때, 단순히 뒤로 가는 것만으로도 점프로 인식하는 경우가 있다. 때문에 이러한 노이즈를 더 제거하기 편리한 Vector 기반 점프 인식 함수를 작성하였다.
## jumpWithVector(pose)
### 기능
vector를 기반으로 점프를 했는지에 대한 여부를 리턴하는 함수.
> 완전히 노이즈를 제거하려면, 좀 더 정교한 스레시홀드 값 설정이 필요하다.
## leftHandsup(pose)
### 기능
왼손을 작게 들었는지, 크게 들었는지, 들지 않았는지 리턴하는 함수.
### Output
0 : 왼손을 들지 않음
1 : 왼손을 작게 들음
2 : 왼손을 크게 들음
## rightHandsup(pose)
### 기능
오른손을 작게 들었는지, 크게 들었는지, 들지 않았는지 리턴하는 함수.
### Output
0 : 오른손을 들지 않음
1 : 오른손을 작게 들음
2 : 오른손을 크게 들음
