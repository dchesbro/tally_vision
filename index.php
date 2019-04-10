<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta content="width=device-width, initial-scale=1, shrink-to-fit=no" name="viewport">
		<link crossorigin="anonymous" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" rel="stylesheet">
		<title>TALLY VISION</title>
	</head>
	<body>
		<main class="container" id="">
			<section class="row">
				<div class="col">
					
					<!-- Voting ballot -->
					<div class="card">
						
						<!-- Title and description -->
						<div class="card-body">
							<h3 class="card-title">Country: "Song Title"</h3>
							<p class="card-text text-muted">Cast your vote in the categories below and tap submit</p>
						</div>
						
						<!-- Voting categories -->
						<ul class="list-group list-group-flush">
						
						<?php
							
							$categories = array(
								array(
									'title'   => 'Category 1',
									'label_0' => 'What the fuck',
									'label_5' => 'This is a banger'
								),
								array(
									'title'   => 'Category 2',
									'label_0' => 'Dead fish',
									'label_5' => 'Hot stuff'
								),
								array(
									'title'   => 'Category 3',
									'label_0' => 'Your shirt looks like a dish rag',
									'label_5' => 'Dolce Gabbana with a few gold chains'
								),
								array(
									'title'   => 'Category 4',
									'label_0' => 'Jr High School PowerPoint',
									'label_5' => 'Future of live performance'
								),
								array(
									'title'   => 'Graham Norton Bitch Quota',
									'label_0' => 'You asked for Eurovision, you got Eurovision',
									'label_5' => 'There is a slight smell of wet dog in the arena'
								)
							);
							
						?>
							
						<?php foreach( $categories as $key => $category ) : ?>
							
							<li class="list-group-item">
								<h5><?php printf( '%d. %s', $key + 1, $category['title'] ); ?></h5>
								<div class="btn-group btn-group-toggle w-100" data-toggle="buttons">
									<label class="btn btn-outline-primary">
										<input autocomplete="off" id="option1" name="options" type="radio"> 0
									</label>
									<label class="btn btn-outline-primary">
										<input autocomplete="off" id="option1" name="options" type="radio"> 1
									</label>
									<label class="btn btn-outline-primary">
										<input autocomplete="off" id="option1" name="options" type="radio"> 2
									</label>
									<label class="btn btn-outline-primary">
										<input autocomplete="off" id="option1" name="options" type="radio"> 3
									</label>
									<label class="btn btn-outline-primary">
										<input autocomplete="off" id="option1" name="options" type="radio"> 4
									</label>
									<label class="btn btn-outline-primary">
										<input autocomplete="off" id="option1" name="options" type="radio"> 5
									</label>
								</div>
								<div class="d-flex justify-content-between">
									<small class="form-text text-muted"><?php printf( '"%s"', $category['label_0'] ); ?></small>
									<small class="form-text text-muted"><?php printf( '"%s"', $category['label_5'] ); ?></small>
								</div>
							</li>
							
						<?php endforeach; ?>
						
						</ul>
						<button class="btn btn-lg btn-block btn-primary" type="button" disabled>Submit</button>
					</div>
					
				</div>
			</section>
		</main>
		
		<script crossorigin="anonymous" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" src="https://code.jquery.com/jquery-3.3.1.slim.min.js"></script>
		<script crossorigin="anonymous" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>
		<script crossorigin="anonymous" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
	</body>
</html>